export default function MutationStatus({ pending, error, message }: { pending: string; error: string; message: string }) {
  return <>
    {pending && <div className="mutation-progress" role="status" aria-live="polite"><span className="mutation-spinner" aria-hidden="true" />{pending}… このままお待ちください。</div>}
    {error && <div className="alert alert--error" role="alert">{error}</div>}
    {!pending && message && <p className="mutation-success" role="status">✓ {message}</p>}
  </>;
}
