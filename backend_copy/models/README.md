# Model notes

The demo uses `yolo26n.pt` for person detection and BoT-SORT for tracking.

The three disaster modes are independent decision engines:
- Flood Rescue AI
- Earthquake Rescue AI
- Landslide Rescue AI

They apply different rescue priorities and severity policies to the shared
person-detection/tracking stream. They are not claimed to be three separately
trained neural networks. A genuinely separate trained model for each disaster
would require disaster-specific labeled imagery and trained weights.

For a production aircraft, flight-control RTL/RTH must live onboard the
flight controller (e.g. Pixhawk/ArduPilot/PX4), not in this laptop demo.
