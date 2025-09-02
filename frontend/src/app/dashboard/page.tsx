export default function DashboardPage() {
    return (
      <div className="min-h-screen p-8">
        <h1 className="text-2xl font-semibold">Добро пожаловать! 🎉</h1>
        <p className="mt-2 text-slate-600">
          Логин сработал, токен сохранён в localStorage (jwt).
          Позже подключим реальную защиту маршрутов и брендинг по домену.
        </p>
      </div>
    );
  }