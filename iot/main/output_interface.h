#ifndef OUTPUT_INTERFACE_H
#define OUTPUT_INTERFACE_H

#include "sensors_interface.h"

void sendData(const SensorData& data) {
  Serial.print("{\"temp_dht\":");
  Serial.print(data.temperature);
  Serial.print(",\"hum_dht\":");
  Serial.print(data.humidity);
  Serial.print(",\"light\":");
  Serial.print(data.light);
  Serial.print(",\"rain\":");
  Serial.print(data.rain);
  Serial.println("}");
}

#endif
