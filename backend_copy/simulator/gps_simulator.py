import argparse
import json
import math
import socket
import time


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--manual", action="store_true")
    args = parser.parse_args()

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    target = ("127.0.0.1", 5005)

    if args.manual:
        lat = float(input("Latitude: "))
        lon = float(input("Longitude: "))
        alt = float(input("Altitude: "))
        speed = float(input("Speed: "))
        battery = float(input("Battery: "))
        payload = {
            "latitude": lat, "longitude": lon, "altitude": alt,
            "speed": speed, "battery": battery, "source": "simulator"
        }
        sock.sendto(json.dumps(payload).encode(), target)
        print("Sent:", payload)
        return

    home_lat, home_lon = 28.613900, 77.209000
    i = 0
    battery = 100.0

    while True:
        # Small demo route around the launch coordinate.
        lat = home_lat + 0.00075 * math.sin(i / 22)
        lon = home_lon + 0.00100 * math.cos(i / 22)
        payload = {
            "latitude": lat,
            "longitude": lon,
            "altitude": 120.0,
            "speed": 8.0,
            "battery": max(0, battery),
            "source": "simulator",
            "timestamp": time.time(),
        }
        sock.sendto(json.dumps(payload).encode(), target)
        print(
            f"GPS -> {lat:.6f}, {lon:.6f} | "
            f"{payload['altitude']:.1f} m | {payload['speed']:.1f} m/s | "
            f"battery {battery:.0f}%"
        )
        battery -= 0.25
        i += 1
        time.sleep(0.5)


if __name__ == "__main__":
    main()
