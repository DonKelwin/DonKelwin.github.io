from machine import Pin
import neopixel
import time

class Lightring:
    
    def __init__(self, num_leds, led_pin):
        self.NUM_LEDS = num_leds
        self.led_pin = Pin(led_pin)

        # Initialisiere das NeoPixel-Objekt
        self.np = neopixel.NeoPixel(self.led_pin, self.NUM_LEDS)
        self.colors = {
            "red": (255, 0, 0),    # Rot
            "green": (0, 255, 0),    # Grün
            "blue": (0, 0, 255),    # Blau
            "cyan": (0, 255, 255),  # Cyan
            "magenta": (255, 0, 255)   # Magenta
            }

        self.base_color = (255, 255, 255)  # Cyan Helle Farbe
        self.clear = (0, 0, 0)
        self.sol = [4, 9, 11, 1, 6, 3, 8]

    #Einzelne LED
    def set_led(self, led_number, color):
        self.np[led_number] = color
        self.np.write()

    # Alle LED'S
    def fill(self, color):
        for i in range(self.NUM_LEDS):
            self.np[i] = color
        self.np.write()
    
    # Alle LEDs aus
    def clear_all(self,):
        for i in range(self.NUM_LEDS):
            self.np[i] = (0, 0, 0)
        self.np.write()

    # Anpassung der Helligkeit
    def dim_color(self, color, factor):
        val1 = color[0]
        val2 = color[1]
        val3 = color[2]
        return (int(val1 * factor), int(val2 * factor), int(val3 * factor))

    # Dreht sich im Kreis für gewisse Sekunden duration
    def spinning_pattern(self, duration):
        start_time = time.time()
    
        # Anzahl der LEDs, die gleichzeitig leuchten sollen
        trail_length = 4

        # Helligkeitsfaktoren für die LEDs im "Schweif"
        brightness_factors = [1.0, 0.6, 0.3, 0.1] 
    
        while time.time() - start_time < duration:
            for i in range(self.NUM_LEDS):
                for j in range(trail_length):
                    led_index = (i - j) % self.NUM_LEDS
                    color = self.dim_color(self.base_color, brightness_factors[j])
                    self.set_led(led_index, color)
            
                for k in range(trail_length, self.NUM_LEDS):
                    self.np[(i - k) % self.NUM_LEDS] = (0, 0, 0)
            
                # Zeige die Änderungen an
                self.np.write()
            
                # Warte kurz, bevor die nächste LED eingeschaltet wird
                time.sleep(0.1) 

        self.clear_all()


    def light_show(self):
        # Beispiel: LEDs in grün leuchten lassen
        self.fill((255, 0, 0))  # RGB für rot
        time.sleep(1)
        # Beispiel: Zweite LED grün machen (Index 1)
        self.set_led(1, (0, 255, 0))  # RGB für grün
        time.sleep(1)
        # Beispiel: Dritte LED blau machen (Index 2)
        self.set_led(2, (0, 0, 255))  # RGB für blau
        time.sleep(1)
        #Beispiel spinning mit Duration in s
        self.spinning_pattern(4)
    
    def blink_182(self):
        self.fill(self.base_color)
        time.sleep(1)
        self.clear_all()
        
    def blink_red(self, t):
        self.fill(self.colors["red"])
        time.sleep(t)
        self.clear_all()
        
    def blink_green(self, t):
        self.fill(self.colors["green"])
        time.sleep(t)
        self.clear_all()

    def blink_solution(self, t_light, t_pause):
        sol = [4, 9, 11, 1, 6, 3, 8]
        for elem in self.sol:
            self.set_led(elem, self.base_color)
            time.sleep(t_light)
            self.set_led(elem, self.clear)
            time.sleep(t_pause)