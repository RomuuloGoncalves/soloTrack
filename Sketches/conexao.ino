#include <WiFiClient.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define MQ9_PIN 34

const char *ssid = "nome-da-rede";
const char *password = "senha-da-rede";

const char *serverAddress = "endereco-do-servidor";

void setup(){
  pinMode(MQ9_PIN, INPUT);
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED){
    delay(100);
    Serial.print(".");
  }
}

void loop(){
  if (WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    WiFiClient client;

    int mq9_value = analogRead(MQ9_PIN);
    Serial.print("Leitura do Sensor: ");
    Serial.println(mq9_value);

    StaticJsonDocument<200> doc;
    doc["id_sensor"] = 1;
    doc["id_arduino"] = 1;
    doc["valor_sensor"] = ;

    String jsonString;
    serializeJson(doc, jsonString);
    Serial.println(jsonString);

    http.begin(client, serverAddress);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("ngrok-skip-browser-warning", "69420");

    int httpResponseCode = http.POST(jsonString);
    if (httpResponseCode > 0){
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    }
    else{
      Serial.print("Erro ao enviar POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }
  delay(5000);
}