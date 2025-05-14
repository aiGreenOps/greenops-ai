#ifndef SENSORS_INTERFACE_H
#define SENSORS_INTERFACE_H

#include <DHT.h>

#define DHTPIN 7
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

const int LDR_PIN = A2;
const int RAIN_PIN = A1;

struct SensorData
{
  float temperature;
  float humidity;
  int light;
  int rain;
};

void initSensors()
{
  dht.begin();
}

SensorData readAllSensors()
{
  SensorData data;
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  delay(100); // Attendi che i segnali si stabilizzino
  data.light = analogRead(LDR_PIN);
  data.rain = analogRead(RAIN_PIN);
  return data;
}

#endif
