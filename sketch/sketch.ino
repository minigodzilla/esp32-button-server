#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "BELL166";
const char* password = "D7E6665A34E4";

const char* serverURL = "http://192.168.2.39:3000/button-press";

const int ledPin = 2;
const int buttonPin = 13;

int buttonState = HIGH;
int lastButtonReading = HIGH;
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50;

bool alreadySent = false;

String deviceName; // will be set from MAC

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
  Serial.println(WiFi.localIP());

  // Generate unique device name from MAC
  deviceName = "esp32-" + WiFi.macAddress();
  deviceName.replace(":", ""); // clean up colons for simplicity
  Serial.print("Device ID: ");
  Serial.println(deviceName);
}

void loop() {
  int reading = digitalRead(buttonPin);

  if (reading != lastButtonReading) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > debounceDelay) {
    if (reading != buttonState) {
      buttonState = reading;

      if (buttonState == LOW && !alreadySent) {
        digitalWrite(ledPin, HIGH);
        sendButtonPress();
        alreadySent = true;
      } else if (buttonState == HIGH) {
        digitalWrite(ledPin, LOW);
        alreadySent = false;
      }
    }
  }

  lastButtonReading = reading;
}

void sendButtonPress() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"device\":\"" + deviceName + "\",\"event\":\"press\"}";

    int httpResponseCode = http.POST(payload);
    Serial.print("POST response: ");
    Serial.println(httpResponseCode);
    http.end();
  } else {
    Serial.println("WiFi not connected. Cannot send event.");
  }
}
