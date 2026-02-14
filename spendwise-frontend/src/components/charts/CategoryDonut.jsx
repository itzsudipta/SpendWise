import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const colors = ['#047857', '#0ea5e9', '#f59e0b', '#f97316', '#ef4444'];

export default function CategoryDonut({ data = [] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}