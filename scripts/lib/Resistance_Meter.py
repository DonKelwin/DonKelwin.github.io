from machine import ADC, Pin
import ADS1115


class ResistanceMeter:
    def __init__(self, id_in, ads, pin_1=None, pin_2=None, measurement_count=5):
        self.id = id_in
        self.pin_1 = pin_1
        self.pin_2 = pin_2
        self.measurement_count = measurement_count
        self.ads = ads
        
        if ads:
            ADS1115.init(0x48, 3, 4, False)
            print(f"Resistance Meter initialized with KY-053 Board and Pins {self.pin_1} and {self.pin_2}.\nThe measurement count is {self.measurement_count}.")
        else: 
            self.adc_1 = ADC(pin_1)
            self.adc_2 = ADC(pin_2)
            print(f"Resistance Meter initialized with Pico and ADC Pins {self.pin_1} and {self.pin_2}.")

    def read_voltage_pico(self):
        voltage_sum_adc_1 = 0
        voltage_sum_adc_2 = 0
        for i in range(self.measurement_count):
            voltage_sum_adc_1 += self.adc_1.read_u16()
            voltage_sum_adc_2 += self.adc_2.read_u16()

        voltage_median_adc_1 = voltage_sum_adc_1 / self.measurement_count
        voltage_median_adc_2 = voltage_sum_adc_2 / self.measurement_count

        voltage_adc_1 = ((voltage_median_adc_1 * 3.3) / 65535)
        voltage_adc_2 = ((voltage_median_adc_2 * 3.3) / 65535)

        voltage_bridge = voltage_adc_1 - voltage_adc_2
        print(f"Resistance Meter {self.id} ADC {self.pin_1}={voltage_adc_1} V")
        print(f"Resistance Meter {self.id} ADC {self.pin_2}={voltage_adc_2} V")
        print(f"Voltage in bridge: {voltage_bridge}")

        return round(voltage_bridge, 1)
    
    def read_voltage_ads(self):
        
        #a0, a1, a2, a3 = ADS1115.readMulti(0, 3)
        
        voltage_adc_0 = ADS1115.raw_to_v(ADS1115.read(0))
        voltage_adc_1 = ADS1115.raw_to_v(ADS1115.read(1))
        voltage_adc_2 = ADS1115.raw_to_v(ADS1115.read(2))
        voltage_adc_3 = ADS1115.raw_to_v(ADS1115.read(3))
        
        voltage_bridge_1 = voltage_adc_0 - voltage_adc_1
        voltage_bridge_2 = voltage_adc_2 - voltage_adc_3
        
        print(f"Resistance Meter {self.id} ADS 0={voltage_adc_0} V")
        print(f"Resistance Meter {self.id} ADS 1={voltage_adc_1} V")
        print(f"Resistance Meter {self.id} ADS 2={voltage_adc_2} V")
        print(f"Resistance Meter {self.id} ADS 3={voltage_adc_3} V")
        print(f"Voltage in bridge 1: {voltage_bridge_1}")
        print(f"Voltage in bridge 2: {voltage_bridge_2}")
        
        return round(voltage_bridge_1, 1), round(voltage_bridge_2, )
    
    def read_voltage(self):
        if self.ads:
            return self.read_voltage_ads()
        else:
            return self.read_voltage_pico()
        
    def validate_voltage_ads(self):
        if self.ads:
            result_1, result_2 = self.read_voltage_ads()
            if result_1 == 0.0 and result_2 == 0.0:
                return self.id, True, self.id + 1, True
            elif result_1 != 0.0 and result_2 == 0.0:
                return  self.id, False, self.id + 1, True
            elif result_1 == 0.0 and result_2 != 0.0:
                return  self.id, True, self.id + 1, False
            else:
                return self.id, False, self.id + 1, False
                  
    def validate_voltage_pico(self):
        if not self.ads:
            result = self.read_voltage_pico()
            if result != 0.0:
                return self.id, False
            else:
                return self.id, True
        
