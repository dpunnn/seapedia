import prisma from '../utils/prisma';

const SLA_DAYS: Record<string, number> = { INSTANT: 1, NEXT_DAY: 2, REGULAR: 5 };

export const processOverdueOrders = async (virtualDate: Date): Promise<number> => {
  const deliveredOrders = await prisma.order.findMany({
    where: { status: 'SEDANG_DIKIRIM', isOverdueProcessed: false },
    include: { statusHistory: { where: { status: 'SEDANG_DIKIRIM' }, orderBy: { createdAt: 'asc' }, take: 1 } },
  });

  let processedCount = 0;

  for (const order of deliveredOrders) {
    const startedAt = order.statusHistory[0]?.createdAt;
    if (!startedAt) continue;

    const deadline = new Date(startedAt);
    deadline.setDate(deadline.getDate() + SLA_DAYS[order.deliveryMethod]);

    if (virtualDate >= deadline) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'PESANAN_SELESAI', isOverdueProcessed: true },
        });
        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'PESANAN_SELESAI',
            note: 'Pesanan otomatis diselesaikan karena melewati SLA pengiriman',
          },
        });
      });
      processedCount++;
    }
  }

  return processedCount;
};
