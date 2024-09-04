from machine import I2C, Pin
import utime
from tcs3472 import TCS3472

class Color_Sensor:
    
    def __init__(self, id_in, i2c_channel, scl_pin, sda_pin, led_pin, init_color_values, freq=400000):
        self.id = id_in
        self.i2c_channel = i2c_channel
        self.freq = freq
        self.init_color_values = init_color_values
        self.delta_value = 100
        
        self.scl = Pin(scl_pin)
        self.sda = Pin(sda_pin)
        self.led_pin_sensor = Pin(led_pin, Pin.OUT)
        
        self.i2c = I2C(self.i2c_channel, scl=self.scl, sda=self.sda, freq=self.freq)
        self.sensor = TCS3472(self.i2c)
        
    def led_on(self):
        self.led_pin_sensor.value(1)
        
    def led_off(self):
        self.led_pin_sensor.value(0)
        
    def read_rgb(self):
        clear, red, green, blue = self.sensor.read()
        return clear, red, green, blue
    
    def probe(self):
        probe = [0, 0, 0, 0]
        for i in range(10):
            utime.sleep(0.1)  # Wait for LED to stabilize
            clear, red, green, blue = self.read_rgb()
            probe[0] += clear
            probe[1] += red
            probe[2] += green
            probe[3] += blue
        probe[0] = int(probe[0] / 10)
        probe[1] = int(probe[1] / 10)
        probe[2] = int(probe[2] / 10)
        probe[3] = int(probe[3] / 10)
        return probe
    
    def init_probe(self):
        init = self.probe()
        for i in range(len(init)):
            self.init_color_values[i] = init[i]
        print("init_value", self.id, "(clear,r,g,b): ", init)
    
    def compare_correct(self):
        test = self.probe()
        print("test_value", self.id, "(clear,r,g,b): ", test)
        comp = [0, 0, 0, 0]
        comp[0] = abs(test[0] - self.init_color_values[0])
        comp[1] = abs(test[1] - self.init_color_values[1])
        comp[2] = abs(test[2] - self.init_color_values[2])
        comp[3] = abs(test[3] - self.init_color_values[3])
        print("delta to test1: comp_value (r,g,b): ", comp)
        
        for t in range(4):
            if comp[t] > self.delta_value:
                return False
            return True
    

