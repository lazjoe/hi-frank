// A wrapper and extension for robot.js
const robot = require('robotjs')

class KeyboardRobot {

    // simulate a key with modifiers {shift: true}
    keyTap(key, alt, ctrl, meta, shift) {
        var m_array = []
        if (alt) {
            m_array.push('alt')
        }
        if (meta) {
            m_array.push('command') // TODO: get the system mac/win to specify the key name, either command or win
        }
        if (ctrl) {
            m_array.push('control')
        }
        if (shift) {
            m_array.push('shift')
        }

        robot.keyTap(key, m_array)
    }
}

keyboard = new KeyboardRobot
