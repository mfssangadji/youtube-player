import _ from 'lodash';
import Sister from 'sister';
import loadYouTubeIframeApi from './loadYouTubeIframeApi';
import YouTubePlayer from './YouTubePlayer';

/**
 * @typedef options
 * @see https://developers.google.com/youtube/iframe_api_reference#Loading_a_Video_Player
 * @param {Number} width
 * @param {Number} height
 * @param {String} videoId
 * @param {Object} playerVars
 * @param {Object} events
 */
let youtubeIframeAPI;

/**
 * A factory function used to produce an instance of YT.Player and queue function calls and proxy events of the resulting object.
 *
 * @param {HTMLElement|String} elementId Either An existing YT.Player instance,
 * the DOM element or the id of the HTML element where the API will insert an <iframe>.
 * @param {YouTubePlayer~options} options See `options` (Ignored when using an existing YT.Player instance).
 * @returns {Object}
 */
export default (elementId, options = {}) => {
  const emitter = Sister();

  if (!youtubeIframeAPI) {
    youtubeIframeAPI = loadYouTubeIframeApi();
  }

  if (options.events) {
    throw new Error('Event handlers cannot be overwritten.');
  }

  if (_.isString(elementId) && !document.getElementById(elementId)) {
    throw new Error('Element "' + elementId + '" does not exist.');
  }

  options.events = YouTubePlayer.proxyEvents(emitter);

  const playerAPIReady = new Promise(async (resolve) => {
    let player;

    if (
      elementId instanceof Object &&
      elementId.playVideo instanceof Function
    ) {
      player = elementId;
    } else {
      const YT = await youtubeIframeAPI;

      player = new YT.Player(elementId, options);
    }

    emitter.on('ready', () => {
      resolve(player);
    });
  });

  const playerAPI = YouTubePlayer.promisifyPlayer(playerAPIReady);

  playerAPI.on = emitter.on;
  playerAPI.off = emitter.off;

  return playerAPI;
};
