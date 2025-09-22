export const enum MouseEvent {
  CLICK = 'onClick',
  CONTEXTMENU = 'onContextMenu',
  DBLCLICK = 'onDoubleClick',
  MOUSEDOWN = 'mousedown',
  MOUSEUP = 'onMouseUp',
  MOUSEENTER = 'onMouseEnter',
  MOUSELEAVE = 'onMouseLeave',
  MOUSEMOVE = 'onMouseMove',
  MOUSEOUT = 'onMouseOut',
  MOUSEOVER = 'onMouseOver',
}

export const enum FocusEvent {
  BLUR = 'onBlur',
  FOCUS = 'onFocus',
  FOCUSIN = 'onFocusIn',
  FOCUSOUT = 'onFocusOut',
}

export const enum KeyboardEvent {
  KEYDOWN = 'onKeyDown',
  KEYPRESS = 'onKeyPress',
  KEYUP = 'onKeyUp',
}

export const enum InputEvent {
  INPUT = 'onInput',
  CHANGE = 'onChange',
  SUBMIT = 'onSubmit',
}

export const enum DragEvent {
  DRAG = 'onDrag',
  DRAGEND = 'onDragEnd',
  DRAGENTER = 'onDragEnter',
  DRAGEXIT = 'onDragExit',
  DRAGLEAVE = 'onDragLeave',
  DRAGOVER = 'onDragOver',
  DRAGSTART = 'onDragStart',
  DROP = 'onDrop',
}

export const EventHandler = {
  [MouseEvent.CLICK]: 'click',
  [MouseEvent.CONTEXTMENU]: 'contextmenu',
  [MouseEvent.DBLCLICK]: 'dblclick',
  [MouseEvent.MOUSEDOWN]: 'mousedown',
  [MouseEvent.MOUSEUP]: 'mouseup',
  [MouseEvent.MOUSEENTER]: 'mouseenter',
  [MouseEvent.MOUSELEAVE]: 'mouseleave',
  [MouseEvent.MOUSEMOVE]: 'mousemove',
  [MouseEvent.MOUSEOUT]: 'mouseout',
  [MouseEvent.MOUSEOVER]: 'mouseover',

  [FocusEvent.BLUR]: 'blur',
  [FocusEvent.FOCUS]: 'focus',
  [FocusEvent.FOCUSIN]: 'focusin',
  [FocusEvent.FOCUSOUT]: 'focusout',

  [KeyboardEvent.KEYDOWN]: 'keydown',
  [KeyboardEvent.KEYPRESS]: 'keypress',
  [KeyboardEvent.KEYUP]: 'keyup',

  [InputEvent.INPUT]: 'input',
  [InputEvent.CHANGE]: 'change',
  [InputEvent.SUBMIT]: 'submit',

  [DragEvent.DRAG]: 'drag',
  [DragEvent.DRAGEND]: 'dragend',
  [DragEvent.DRAGENTER]: 'dragenter',
  [DragEvent.DRAGEXIT]: 'dragexit',
  [DragEvent.DRAGLEAVE]: 'dragleave',
  [DragEvent.DRAGOVER]: 'dragover',
  [DragEvent.DRAGSTART]: 'dragstart',
  [DragEvent.DROP]: 'drop',
}

export const domEventHandlers = new Map(Object.entries(EventHandler))

export const isDOMEventHandler = (key: string): boolean => domEventHandlers.has(key)

export const getEventNameFromHandler = (handler: string): string | null => {
  if (!isDOMEventHandler(handler)) return null

  return domEventHandlers.get(handler)
}
