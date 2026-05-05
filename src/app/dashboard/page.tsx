export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Dashboard Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-2xl font-bold">₱150,000.00</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <p className="text-sm text-muted-foreground">Income</p>
          <p className="text-2xl font-bold text-primary">₱50,000.00</p>
        </div>
        <div className="p-6 border rounded-xl shadow-sm bg-card">
          <p className="text-sm text-muted-foreground">Expenses</p>
          <p className="text-2xl font-bold text-destructive">₱10,000.00</p>
        </div>
      </div>
    </div>
  );
}
