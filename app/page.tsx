import ClientHome from '@/components/ClientHome'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4 sm:p-8 md:p-24">
      <main className="z-10 w-full max-w-2xl">
        <ClientHome />
      </main>
    </div>
  );
}