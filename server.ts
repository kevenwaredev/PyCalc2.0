import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  // Python Info endpoint
  app.get('/api/python/info', async (req, res) => {
    try {
      const py = spawn('python3', ['--version']);
      let ver = '';
      py.stdout.on('data', (d) => (ver += d.toString()));
      py.stderr.on('data', (d) => (ver += d.toString()));
      py.on('close', () => {
        res.json({
          status: 'online',
          version: ver.trim(),
          engine: 'CPython 3',
          modules: ['math', 'sys', 'os', 'customtkinter (desktop)'],
        });
      });
    } catch (err: any) {
      res.json({ status: 'error', message: err.message });
    }
  });

  // Python Math Calculation endpoint
  app.post('/api/python/calculate', (req, res) => {
    const { expression, angleMode } = req.body;
    if (!expression || typeof expression !== 'string') {
      return res.status(400).json({ error: 'Expressão inválida' });
    }

    const pyScript = `
import sys
import calculadora

eng = calculadora.ScientificMathEngine()
eng.angle_mode = "${angleMode || 'DEG'}"
try:
    res = eng.evaluate("""${expression.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}""")
    if abs(res - round(res)) < 1e-12:
        print(int(round(res)))
    else:
        print(f"{res:.12g}")
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;

    const py = spawn('python3', ['-c', pyScript]);
    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (d) => (stdout += d.toString()));
    py.stderr.on('data', (d) => (stderr += d.toString()));

    py.on('close', (code) => {
      if (code !== 0) {
        return res.status(400).json({ error: stderr.trim() || 'Erro no cálculo Python' });
      }
      res.json({ result: stdout.trim(), engine: 'Python 3.10' });
    });
  });

  // Python Arbitrary Code Execution endpoint
  app.post('/api/python/execute', (req, res) => {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Código inválido' });
    }

    const py = spawn('python3', ['-c', code]);
    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      py.kill();
      res.status(408).json({ error: 'Tempo limite de execução atingido (5s)' });
    }, 5000);

    py.stdout.on('data', (d) => (stdout += d.toString()));
    py.stderr.on('data', (d) => (stderr += d.toString()));

    py.on('close', (exitCode) => {
      clearTimeout(timer);
      res.json({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode,
        success: exitCode === 0,
      });
    });
  });

  // Serve raw Python file directly
  app.get('/calculadora.py', (req, res) => {
    const filePath = path.join(__dirname, 'calculadora.py');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'text/x-python');
      res.setHeader('Content-Disposition', 'attachment; filename="calculadora.py"');
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).send('Arquivo não encontrado');
    }
  });

  // Mount Vite Middleware
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculadora Python Server rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar servidor:', err);
});
