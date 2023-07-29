import fastify from 'fastify';
import fastifyWebsocket, { SocketStream } from '@fastify/websocket';
import { v4 } from 'uuid';

const app = fastify({
   logger: true,
   requestIdLogLabel: 'trackingId',
   genReqId: () => v4(),
 });

app.register(fastifyWebsocket).then(() => {
   console.log('Websocket plugin registered');
   app.get('/ws/test', { websocket: true }, (connection: SocketStream, req) => {
     connection.socket.on('connect', message => {
         console.log('Client connected');
         app.log.info(message);
      });
      connection.socket.on('message', message => {
         app.log.info(message);
         connection.socket.send(message.toString());
      });
   });
   app.get('/health/live', async (request, reply) => {
      reply.send({ status: 'ok' });
   });
   
   const start = async () => {
      try {
         await app.listen({ port: 3000 });
         const address = app.server.address();
         const port = typeof address === 'string' ? address : address?.port;
         console.log(`Server listening on port ${port}`);
      } catch (err) {
         app.log.error(err);
         process.exit(1);
      }
   }
   app.ready(() => start());
});


