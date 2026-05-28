import { messageOf } from '../utils/errors';

export default function ErrorState({ error, title = 'Unable to load data' }) {
  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{messageOf(error)}</p>
    </div>
  );
}
