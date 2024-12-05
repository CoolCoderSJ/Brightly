# Brightly

Another Soren Iverson recreation.

This app adjusts the system brightness based on the number of steps taken by the user. It uses the Health Connect API to read step data and adjusts the brightness accordingly.

## Features

- Reads step data from Health Connect.
- Adjusts system brightness based on the number of steps taken.
- Allows users to set an optimal brightness level for when 10,000 steps are reached.
- Runs a foreground service to periodically update brightness in the background.

## Usage
Install the apk from the releases page. Open the app and grant the necessary permissions. The app will automatically adjust the brightness based on the number of steps taken every 15 seconds.

## Notes
- Since this was mainly built as a joke, it is not optimized at all and is not recommended for daily use.
- The app must stay open (it can be in the background) for brightness updates to work 