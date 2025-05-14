#include "sensors_interface.h"
#include "output_interface.h"

void setup() {
  Serial.begin(9600);
  initSensors();
}

void loop() {
  SensorData data = readAllSensors();
  sendData(data);

  delay(1000);
}
