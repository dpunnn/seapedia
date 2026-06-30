import app from './app';
import prisma from './utils/prisma';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Docs: http://localhost:${PORT}/api/docs`);
  });
}

main().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
