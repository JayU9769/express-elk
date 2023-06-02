import express, {Express, NextFunction, Request, Response} from 'express';
import dotenv from 'dotenv';
import { Console } from "./helpers/logging";

const newConsole = new Console();
dotenv.config();

const myLogger = function (req: Request, res: Response, next: NextFunction) {

  const ip = req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      null;

  let requestObj: any;
  switch (req.method) {
    case "GET":
      requestObj = req.query
      break;
    case "POST":
    case "PATCH":
      requestObj = req.body
      break;
  }

  var start = Date.now();
  res.on('finish', function() {
    let duration = Date.now() - start;
    newConsole.log({
      client: ip,
      method: req.method,
      message: "Test",
      request: requestObj,
      url: req.originalUrl,
      duration: (parseFloat(String(duration / 1000)).toFixed(2)).toString()
    })
    // log duration
  });

  next()
}


const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(myLogger);

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
