import time
from Color_Sensor import Color_Sensor
from Lightring import Lightring
from Resistance_Meter import ResistanceMeter
from picodfplayer import DFPlayer
import sys

# INITS
player=DFPlayer(uartInstance=1, txPin=4, rxPin=5, busyPin=18)
time.sleep(2)
player.setVolume(15)

color_sensor_1 = Color_Sensor(id_in=1, i2c_channel=1, scl_pin=15, sda_pin=14, led_pin=22, init_color_values=[32885, 27628, 7588, 5940])
color_sensors = [color_sensor_1]

lightring = Lightring(12, 11)

resistance_meter_1 = ResistanceMeter(id_in=1, pin_1=0, pin_2=1, ads=False)
resistance_meter_2 = ResistanceMeter(id_in=2, pin_1=0, pin_2=1, ads=True)
resistance_meters = [resistance_meter_1, resistance_meter_2]

def farb_messung(glow_ind_the_dark):
    farb_messung_results = {}
    for sensor in color_sensors:
        if not glow_ind_the_dark:
            sensor.led_on() #Anpassen für Glow-in-the-dark zu off
        valid = sensor.compare_correct()
        idx = sensor.id - 1
        farb_messung_results[idx] = valid
    return farb_messung_results


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
    return resistance_messung_results


def combine_dicts(dict_1, dict_2):
    finaldict = dict(((key, [dict_1[key], dict_2[key]]) if key in dict_1.keys() and dict_2.keys() else None for key in dict_1))
    return finaldict

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

def play_song(dfplayer, file, song):
    #Check if player is busy.
    busy = dfplayer.queryBusy()
    print('Playing Song?', busy)
    if not busy:    
        dfplayer.playTrack(file, song)
    else:
        time.sleep(1)
        self.play_song(dfplayer, file, song)
    
def main():
    try:
        trial = 0
        while (trial < 3):
            print(trial)
            time.sleep(0.5)
            farbe = farb_messung(False)
            resistance = get_resistance()
            res = validierung(farbe, resistance)
            play_song(player, 2, 2)
            lightring.spinning_pattern(3)
            time.sleep(0.5)
            if not res:
                play_song(player, 4, 1)
                lightring.blink_red(2)
            else:
                lightring.blink_green(2)
                lightring.blink_solution(3, 2)
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
        sys.exit()
    
    finally:
        sys.exit()
        
main()
            
