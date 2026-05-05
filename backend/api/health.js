export default async function handler(req, res) {
  console.log('[health] Incoming request', {
    method: req?.method,
  });

  return res.status(200).json({
    success: true,
    service: 'backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
