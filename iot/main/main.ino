#include "sensors_interface.h"
#include "output_interface.h"

unsigned long lastDisplayUpdate = 0;
const unsigned long displayInterval = 60000; // ogni 60 secondi

void setup() {
  Serial.begin(9600);
  initSensors();
  initLCD();

  // Mostra subito i primi dati
  SensorData initialData = readAllSensors();
  sendData(initialData);
  displayData(initialData);

  lastDisplayUpdate = millis(); // Avvia il timer da ora
}

void loop() {
  SensorData data = readAllSensors();
  sendData(data);

  unsigned long currentMillis = millis();
  if (currentMillis - lastDisplayUpdate >= displayInterval) {
    displayData(data);
    lastDisplayUpdate = currentMillis;
  }

  delay(1000);
}
