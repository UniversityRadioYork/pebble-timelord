# pebble-timelord
> A simple Pebble app to show the same information as the studio clock in URY.
> Currently does not support Pebble Time Round.

## How to install
- Install the [Pebble SDK](https://developer.pebble.com/sdk/)
```bash
$ pebble build # will create a .pbw in `build/`
$ pebble install --phone PHONE_IP_ADDRESS # to install to your phone
```
## TODO
- [x] Display Studio Information & Current Show
- [x] Add loading screen with URY logo
- [x] Vertical align show name
- [x] Display show description
- [x] Update information periodically
- [x] Use Local Storage on phone to cache information
- [x] Display upcoming shows
- [ ] Allow customisation
- [ ] Push notifications for radio silence
- [ ] Have notifications for shows starting soon

## License
Copyright © 2016 University Radio York. Released under the MIT license.
