const EventEmitter = require('events');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

class SensorReader extends EventEmitter {
  constructor() {
    super();
    const port = new SerialPort({ path: 'COM4', baudRate: 9600 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', (data) => {
      try {
        const json = JSON.parse(data.trim());
        this.emit('data', json);
      } catch (err) {
        console.error('⚠️ Errore nel parsing JSON:', err.message);
      }
    });

    port.on('open', () => console.log('🔌 Porta seriale aperta'));
    port.on('error', err => console.error('❌ Errore porta seriale:', err.message));
  }
}

module.exports = new SensorReader();
