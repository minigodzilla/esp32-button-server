#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "MagicWorkshop";
const char* password = "toronto2025";

const char* serverURL = "http://192.168.0.100:3000/button-press";

const int ledPin = 2;
const int buttonPin = 13;

int buttonState = HIGH;
bool alreadySent = false;

unsigned long lastLoopTime = 0;
const unsigned long loopInterval = 10; // milliseconds = 100 Hz

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.println(WiFi.localIP());

  String mac = WiFi.macAddress();
  mac.replace(":", "");
  Serial.print("Device MAC: ");
  Serial.println(mac);
}

void loop() {
  unsigned long now = millis();
  if (now - lastLoopTime < loopInterval) return;
  lastLoopTime = now;

  int reading = digitalRead(buttonPin);

  if (reading == LOW && !alreadySent) {
    digitalWrite(ledPin, HIGH);
    sendButtonPress();
    alreadySent = true;
  }

  if (reading == HIGH && alreadySent) {
    digitalWrite(ledPin, LOW);
    alreadySent = false;
  }
}

void sendButtonPress() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String mac = WiFi.macAddress();
    mac.replace(":", "");

    String payload = "{\"device\":\"" + mac + "\",\"event\":\"press\"}";

    int httpResponseCode = http.POST(payload);
    Serial.print("POST response: ");
    Serial.println(httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi not connected. Cannot send event.");
  }
}
