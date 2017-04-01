const {Editor} = require('./editor')

var stopChars = ' ,.:-)(<>!?（）/，。；：“”！？《》'

/** Usage **
 * 
 * The format of bold, italic, underline, strike-through and superscript, subscript are supported
 * All formatted text will be forcely recognized as fragmented corpus (translated separatedly), and can be changed into reserved corpus
 * All non-source language text will be forced to reserved (do-not-translate) corpus 
 * Corpus will recognized only in same formatted text
 * 
 * Keyboard Definition
 * 
 * d | ->: move cursor right
 * ctrl + d | ->: move cursor to next blank
 * alt  + d | ->: move cursor to next blank, in English or similar western language, it's same as ctrl + d | ->
 * Similar for a | <- to move cursor left
 * shift + ctrl | alt + (a | <-) | (d | ->): select the text using similar behavior of move cursor
 * w | up: move cursor up
 * s | down: move cursor down
 * space: insert a space
 * backspace: delete a space or line break. No other characters can be deleted
 * enter: intert a line break. Text in different line will be translated separated by default and user can further combine in annoted target pane
 * r: set the selection as a reserved corpus
 * f: set the selection as a fragmented corpus 
 */
class AnnotatedSource extends Editor {
    constructor(args) {
        args.id = args.id || 'annotated-source'
        args.title = args.title || 'ANNOTATED SOURCE'
        super(args)

    }
}