const int ledPin = 2;
const int buttonPin = 13;

int buttonState = HIGH;         // Current stable state
int lastButtonReading = HIGH;   // Last raw reading from the pin
unsigned long lastDebounceTime = 0;
const unsigned long debounceDelay = 50; // in milliseconds

void setup() {
  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  int reading = digitalRead(buttonPin);

  // If reading has changed from the last recorded state
  if (reading != lastButtonReading) {
    lastDebounceTime = millis();  // reset the debounce timer
  }

  // If the reading has been stable for longer than the debounce delay
  if ((millis() - lastDebounceTime) > debounceDelay) {
    // And it's different from the last stable state
    if (reading != buttonState) {
      buttonState = reading;
    }
  }

  lastButtonReading = reading;

  // Control LED based on debounced button state
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);
  } else {
    digitalWrite(ledPin, LOW);
  }
}
