type StatProps = {
  label: string;
  value: number | string;
};

export const StatRow = ({ label, value }: StatProps) => (
  <div className="flex justify-between border-b py-2 bg-neutral-800 px-4 rounded-lg">
    <span className="text-sm text-white">{label}</span>
    <span className="text-lg font-medium text-white">{value}</span>
  </div>
);