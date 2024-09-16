import time
import Color_Sensor
from Lightring import Lightring
from Resistance_Meter import ResistanceMeter
from picodfplayer import DFPlayer
import sys
import _thread
from machine import I2C, Pin

# INITS
player=DFPlayer(uartInstance=1, txPin=4, rxPin=5, busyPin=17)
time.sleep(2)
player.setVolume(15)

init_color_values_fillennium_malcon_x_wing_tie_fighter=[[5, 0, 2, 2], [12, 2, 6, 3], [9, 2, 5, 2]]
delta_value = 15
led_pin_sensor1 = Pin(8, Pin.OUT)
led_pin_sensor2 = Pin(9, Pin.OUT)
led_pin_sensor3 = Pin(16, Pin.OUT)

lightring = Lightring(12, 12)
led_stars = Lightring(12, 13)

resistance_meter_1 = ResistanceMeter(id_in=1, pin_1=0, pin_2=1, ads=False)
resistance_meter_2 = ResistanceMeter(id_in=2, pin_1=0, pin_2=1, i2c_pin=0, ads=True)
resistance_meters = [resistance_meter_1, resistance_meter_2]


"""
    Performs color measurement on multiple sensors and compares the results against predefined initial color values.

    The function collects color data (RGB + clear) from a set of sensors and compares the measured values to predefined
    thresholds. The comparison is based on delta values for each color channel.

    Returns:
        dict: A dictionary with sensor index as the key and a boolean value indicating whether the measurement is valid.
"""
def farb_messung():
    farb_messung_results = {}
    sensor_data = Color_Sensor.read_all_sensors(7)
    i = 0
    for name, averages in sensor_data:
        valid = True
        print(f"{name}", averages)
        comp = [0, 0, 0, 0]
        comp[0] = abs(averages[0] - init_color_values_fillennium_malcon_x_wing_tie_fighter[i][0])
        comp[1] = abs(averages[1] - init_color_values_fillennium_malcon_x_wing_tie_fighter[i][1])
        comp[2] = abs(averages[2] - init_color_values_fillennium_malcon_x_wing_tie_fighter[i][2])
        comp[3] = abs(averages[3] - init_color_values_fillennium_malcon_x_wing_tie_fighter[i][3])
        print(f"delta to test {name}: comp_value (r,g,b): ", comp)
                
        for t in range(4):
            if comp[t] > delta_value:
                valid = False
        idx = i
        farb_messung_results[idx] = valid
        i += 1
    print("Farbmessung correct:[Fillennium Malcon (oben), X-Wing (links), TIE-Fighter(rechts)]:", farb_messung_results)
    return farb_messung_results


"""
    Reads and validates resistance measurements from multiple resistance meters.

    This method reads voltage measurements from both ADS1115 and Pico's internal ADC and checks whether they fall
    within valid ranges. Results are stored in a dictionary based on the meter's index.

    Returns:
        dict: A dictionary where keys represent meter indices and values are booleans indicating measurement validity.
"""
def get_resistance():
    resistance_messung_results = {}
    for meter in resistance_meters:
        if meter.ads:
            idx_1, res_1, idx_2, res_2 = meter.validate_voltage_ads()
            idx_1 -= 1
            idx_2 -= 1
            resistance_messung_results[idx_1] = res_1
            resistance_messung_results[idx_2] = res_2
        else: 
            idx, result = meter.validate_voltage_pico()
            idx -= 1
            resistance_messung_results[idx] = result
    print("Widerstand correct:[X, X, X]:", resistance_messung_results)
    return resistance_messung_results


"""
    Combines two dictionaries by matching keys, and groups their values in a list.

    If a key exists in both dictionaries, their respective values are combined in a list. If a key exists in only one 
    dictionary, it will not be included in the final dictionary.

    Args:
        dict_1 (dict): First dictionary.
        dict_2 (dict): Second dictionary.

    Returns:
        dict: A dictionary where each key maps to a list of values from the two input dictionaries.
"""
def combine_dicts(dict_1, dict_2):
    finaldict = dict(((key, [dict_1[key], dict_2[key]]) if key in dict_1.keys() and dict_2.keys() else None for key in dict_1))
    return finaldict


"""
    Validates the results of both color and resistance measurements.

    Combines the results from the color measurement and resistance measurement, and checks if all sensors
    have valid results. If any sensor fails, it reports the failure and exits.

    Args:
        farb_mess_resultate (dict): The results of the color measurement.
        resistance_mess_resultate (dict): The results of the resistance measurement.

    Returns:
        bool: True if all sensors pass validation, otherwise False.
"""
def validierung(farb_mess_resultate, resistance_mess_resultate):
    results = combine_dicts(farb_mess_resultate, resistance_mess_resultate)
    if len(results) != 3:
        print(False, "Not all sensors are working")
        return False
    else:
        for k, v in results.items():
            if False in v:
                print(False, k, v, "This sensor is faulty")
                return False
            else:
                print(True, "all right")
                return True


"""
    Plays a song using the DFPlayer module, checking whether it is busy before starting playback.

    If the DFPlayer is currently busy playing another track, the function waits and tries again.

    Args:
        dfplayer (DFPlayer): The DFPlayer object controlling the music playback.
        file (int): The folder/file number to be played.
        song (int): The specific song number to be played.

"""
def play_song(dfplayer, file, song):
    #Check if player is busy.
    busy = dfplayer.queryBusy()
    print('Playing Song?', busy)
    if not busy:    
        dfplayer.playTrack(file, song)
    else:
        time.sleep(1)
        self.play_song(dfplayer, file, song)
        

"""
    Checks if all figures (sensors) are ready by analyzing their voltage measurements.

    The function loops over the provided sensors, reads the voltage from each, and evaluates whether the measurements
    indicate that the figures are ready.

    Args:
        list_of_sensors (list): List of sensor objects to be evaluated.

    Returns:
        bool: True if all figures are ready (i.e., within the valid voltage range), otherwise False.
"""
def figures_ready(list_of_sensors):
    print("Searching for figures...")
    list_of_values = []
    for sensor in list_of_sensors:
        if sensor.ads:
            volt_b_1, volt_b_2 = sensor.read_voltage()
            volt_1 = sensor.bridge_with_figure(volt_b_1)
            volt_2 = sensor.bridge_with_figure(volt_b_2)
            list_of_values.append(volt_1)
            list_of_values.append(volt_2)
        else:
            volt_b = sensor.read_voltage()
            volt = sensor.bridge_with_figure(volt_b)
            list_of_values.append(volt)
        print(list_of_values)
            
    if False in list_of_values:
        print(f"list of measured resistance: {list_of_values}")
        print("figures not ready, will try again in second")
        return False
    else:
        print("figures ready, will follow with sensor readings")
        return True


"""
    Main function to handle the box logic, including initializing LEDs, playing songs, checking figure readiness,
    validating color and resistance measurements, and giving feedback through lights and sound.

    The box will perform several trials to check for the readiness of figures, conduct measurements, and validate
    results. If validation fails, it plays a failure sound; otherwise, it plays success music.
"""
def main():
    try:
        led_pin_sensor1.value(0)
        led_pin_sensor2.value(0)
        led_pin_sensor3.value(0)
        
        play_song(player, 1, 3)
        lightring.fill(lightring.colors["yellow"])
        time.sleep(30)
        while not figures_ready(resistance_meters):
            time.sleep(3)
        trial = 0
        while (trial < 3):
            print(trial)
            time.sleep(0.5)
            farbe = farb_messung()
            resistance = get_resistance()
            res = validierung(farbe, resistance)
            play_song(player, 2, 2)
            lightring.spinning_pattern(3)
            time.sleep(0.5)
            if not res:
                play_song(player, 4, 2)
                lightring.blink_red(2)
            else:
                play_song(player, 5, 1)
                lightring.blink_green(2)
                lightring.blink_solution(3, 2, [2,2,3,6,0,5,9,10,1,8,7,11])
                sys.exit()
            trial += 1
            time.sleep(2)
        
        play_song(player, 3, 1)
        lightring.blink_red(0.3)
        time.sleep(0.1)
        lightring.blink_red(0.3)
        time.sleep(0.1)
        lightring.blink_red(0.3)
        
        print("FAILED")
        sys.exit()
    
    except KeyboardInterrupt:
        print("Got CTL+c")
        lightring.clear_all()
        led_stars.clear_all()
    
    finally:
        sys.exit()


_thread.start_new_thread(main, ())
led_stars.star_pattern()
