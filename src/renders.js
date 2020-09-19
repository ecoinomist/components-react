import classNames from 'classnames'
import React from 'react'
import { Active, debounce, LANGUAGE, shortNumber, SORT_ORDER, toUpperCase } from 'utils-pack'
import ColorSwatch from './ColorSwatch'
import { FILE } from './files'
import Icon from './Icon'
import Image from './Image'
import Row from './Row'
import Text from './Text'

export const noSpellCheck = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
}

/**
 * RENDER HELPERS ==============================================================
 * =============================================================================
 */

/**
 * Create Color Swatch Options from RGB Definition for use with Dropdowns
 *
 * @param {Object|Array<Object>} colorObj - definition from variables.js
 * @param {Object} Active - object containing active .LANG._
 * @returns {Object<lang[{text, value, content}]>} options - grouped by language code, for use with dropdowns
 */
export function colorDropdownOptions (colorObj, Active) {
  const options = {
    get items () {
      return this[Active.LANG._] || this[LANGUAGE.ENGLISH._] || []
    }
  }
  for (const key in colorObj) {
    const {_, ...langs} = colorObj[key]
    const value = String(_) // Dropdown `value` cannot be array
    for (const lang in langs) {
      const text = langs[lang]
      options[lang] = (options[lang] || []).concat({
        text,
        value,
        content: <Row className='input--dropdown__option middle'>
          <ColorSwatch value={value} className='input--dropdown__option__color'/>
          <Text className='margin-top-smallest'>{text}</Text>
        </Row>
      })
    }
  }
  return options
}

/**
 * Create Language Options from Language Definition for use with Dropdowns
 *
 * @param {Object|Array<Object>} languageObj - definition from variables.js
 * @param {Boolean} [selection] - whether to render as selected language flag and code, default is searchable text
 * @returns {Object<lang[{text, value, content}]>} options - grouped by language code, for use with dropdowns
 */
export function languageDropdownOptions (languageObj, {selection} = {}) {
  const options = {
    get items () {
      return this[Active.LANG._] || this[LANGUAGE.ENGLISH._] || []
    }
  }
  for (const key in languageObj) {
    const {_, lang: name, ...langs} = languageObj[key]
    for (const lang in langs) {
      const text = langs[lang]
      options[lang] = (options[lang] || []).concat({
        text: selection
          ? (
            <Row className='input--dropdown__option middle'>
              <Image className='margin-right-smaller' name={`${_.toLowerCase()}.svg`}
                     path={`${FILE.PATH_IMAGES}flags/`}/>
              <Text className='no-wrap'>{toUpperCase(_)}</Text>
            </Row>
          )
          : `${text} ${name}`, // make option searchable both in chosen and native language
        value: _,
        content: <Row className='input--dropdown__option middle'>
          <Image className='margin-right-small' name={`${_.toLowerCase()}.svg`} path={`${FILE.PATH_IMAGES}flags/`}/>
          <Text>{text}</Text>
        </Row>
      })
    }
  }
  return options
}

/**
 * Render Selected Option with Color Swatch in Multiple Choices Dropdown
 * @example:
 *    FIELD.DEF = {
 *      [FIELD.ID.COLOR]: {
 *        view: FIELD.TYPE.DROPDOWN,
 *        renderLabel: colorDropdownChoice,
 *      }
 *    }
 *
 * @param {Object<value, text>} obj - selected dropdown item
 * @returns {Object<content>}
 */
export function colorDropdownChoice (obj) {
  return {
    content: <Text className='bottom'>
      <ColorSwatch value={obj.value} className='input--dropdown__option__color'/>
      <Text>{obj.text}</Text>
    </Text>
  }
}

/**
 * Render Currency Amount in consistent manner
 *
 * @param {Number|String} amount - float number or string
 * @param {Number} [decimals] - the number of decimal digits to keep
 * @param {*} [props] - other pros to pass
 * @returns {Object} - React component
 */
export function renderCurrency (amount, decimals, props) {
  return renderFloat(amount, decimals != null ? decimals : (amount < 100 ? 2 : 0), props)
}

/**
 * Render Float Number as Localised String with Faded Decimals
 *
 * @param {String|Number} value
 * @param {Number|Undefined} [decimals] - the number of decimal digits to keep, default has no decimals (rounded down)
 * @param {*} [props] - other pros to pass
 * @return {Object} - React component
 */
export function renderFloat (value, decimals, props) {
  const decimal = String(value).split('.')[1]
  return (
    <Text {...props}>
      {Math.floor(value).toLocaleString()}
      {decimals !== 0 && decimal &&
      <Text className='fade--quarter normal no-margin'>
        {Number('0.' + decimal).toLocaleString(undefined, decimals == null ? undefined : {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).substr(1)}
      </Text>
      }
    </Text>
  )
}

/**
 * Render Float Number as Shortened Localised String with Faded Decimals (keeping only given significant digits)
 *
 * @param {String|Number} value
 * @param {Number} [digits] - the number of significant digits to keep
 * @param {*} [props] - other pros to pass
 * @return {Object} - React component
 */
export function renderFloatShort (value, digits = 3, props) {
  const [number, unit] = shortNumber(value, digits).split(/([a-zA-Z]+)/) // split at SI unit, keeping the unit
  return (
    <Text {...props}>{renderFloat(number, undefined, {className: 'no-margin'})}{unit}</Text>
  )
}

/**
 * Render Sort Icon
 *
 * @param {Number|Undefined} order - sorting order, one of renderSort.icon keys
 * @param {Number|Undefined} [id] - of the column or row to sort
 * @param {Function} [onClick] - callback when sort Icon is clicked, received clicked sort object
 * @param {String} [className] - CSS class names to add
 */
export function renderSort ({id, order}, {onClick, className} = {}) {
  return (
    <Icon
      className={classNames('app__sort__icon', className, {active: !order})}
      name={renderSort.icon[order || 0]}
      onClick={onClick && (() => onClick({id, order}))}
    />
  )
}

renderSort.icon = SORT_ORDER

/**
 * Resize Element Width to Match Content Length
 *
 * @param {String} value - of the element to resize
 * @param {Object} style - of the element to resize
 * @param {Boolean|Number} offset - count of characters to add to final width
 */
export function resizeToContent (value, style, offset = 1) {
  // Add additional character to prevent truncation from uneven fonts
  // boolean `offset` evaluates to 1 by default.
  style.width = value.length + Number(offset) + 'ch'
  style.boxSizing = 'content-box'
}

/**
 * Event handler to autosize Input height to match typed in text height
 * @example:
 *  <Input type='textarea' onKeyUp={toTextHeight} />
 */
export const toTextHeight = debounce(toTextHeightFunc, 50, {leading: true})

export function toTextHeightFunc (e) {
  if (!e.target) return

  // Reset field height
  e.target.style.height = 'inherit'

  // Get the computed styles for the element
  const computed = window.getComputedStyle(e.target)

  // Calculate the height
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
    + e.target.scrollHeight
    + parseInt(computed.getPropertyValue('border-bottom-width'), 10)

  e.target.style.height = `${Math.min(height, Math.round(window.innerHeight / 5))}px`
}
