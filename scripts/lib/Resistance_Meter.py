from machine import ADC, Pin
import ADS1115


class ResistanceMeter:
    def __init__(self, pin_1, pin_2, ads, measurement_count=5):
        self.pin_1 = pin_1
        self.pin_2 = pin_2
        self.measurement_count = measurement_count
        self.ads = ads
        
        if ads:
            ADS1115.init(0x48, 3, 4, False)
        else: 
            self.adc_1 = ADC(pin_1)
            self.adc_2 = ADC(pin_2)

        self.voltage_adc_1 = 0
        self.voltage_adc_2 = 0
        self.voltage_bridge = 0

        print(f"Resistance Meter initialized with ADC Pins {self.pin_1} and {self.pin_2}.\n The measurement count is {self.measurement_count}.")

    def read_voltage_pico(self):
        print(f"ADC 1: {self.adc_1.read_u16()}")
        print(f"ADC 2: {self.adc_2.read_u16()}")
        voltage_sum_adc_1 = 0
        voltage_sum_adc_2 = 0
        for i in range(self.measurement_count):
            voltage_sum_adc_1 += self.adc_1.read_u16()
            voltage_sum_adc_2 += self.adc_2.read_u16()

        voltage_median_adc_1 = voltage_sum_adc_1 / self.measurement_count
        voltage_median_adc_2 = voltage_sum_adc_2 / self.measurement_count

        self.voltage_adc_1 = ((voltage_median_adc_1 * 3.3) / 65535)
        self.voltage_adc_2 = ((voltage_median_adc_2 * 3.3) / 65535)

        self.voltage_bridge = self.voltage_adc_1 - self.voltage_adc_2
        print(f"Vm (Volt) ADC 1={self.voltage_adc_1}")
        print(f"Vm (Volt) ADC 2={self.voltage_adc_2}")
        print(f"Voltage in bridge: {self.voltage_bridge}")

        return self.voltage_bridge
    
    def read_voltage_ads(self):
        print(f"ADS 1: {ADS1115.read(self.pin_1)}")
        print(f"ADS 2: {ADS1115.read(self.pin_2)}")
        
        self.voltage_adc_1 = ADS1115.raw_to_v(ADS1115.read(self.pin_1))
        self.voltage_adc_2 = ADS1115.raw_to_v(ADS1115.read(self.pin_2))
        
        self.voltage_bridge = self.voltage_adc_1 - self.voltage_adc_2
        print(f"Vm (Volt) ADS 1={self.voltage_adc_1}")
        print(f"Vm (Volt) ADS 2={self.voltage_adc_2}")
        print(f"Voltage in bridge: {self.voltage_bridge}")
        
        return self.voltage_bridge
        
