#ifndef OUTPUT_INTERFACE_H
#define OUTPUT_INTERFACE_H

#include "sensors_interface.h"
#include <LiquidCrystal.h>

// Pin: RS, E, D4, D5, D6, D7
LiquidCrystal lcd(12, 11, 5, 4, 3, 2);

void initLCD() {
  lcd.begin(16, 2);
  lcd.clear();
  lcd.print("GreenOps Ready");
  delay(1500);
}

void displayData(const SensorData& data) {
  lcd.clear();

  // Riga 0: T:xx.xx     R:xxx
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(data.temperature, 2);

  lcd.setCursor(9, 1);  // colonna 9, riga 0
  lcd.print("R:");
  lcd.print(data.rain);

  // Riga 1: L:xxx        H:xx
  lcd.setCursor(0, 1);
  lcd.print("L:");
  lcd.print(data.light);

  lcd.setCursor(9, 0);  // colonna 9, riga 1
  lcd.print("H:");
  lcd.print((int)data.humidity);  // intero
}


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
