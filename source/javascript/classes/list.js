/* This loads and manages the list! */

const ListManager = (($) => {
  return (targetList = "#events-list") => {
    const $target = typeof targetList === 'string' ? $(targetList) : targetList;

    const renderEvent = (item) => {
      var gmtDate = new Date(item.start_datetime).toGMTString();
      var date = moment(new Date(gmtDate)).format(new Date(item.start_datetime).getHours() == 0 ? "dddd MMM DD" : "dddd MMM DD, h:mma");

      // console.log(date, new Date(item.start_datetime), new Date(item.start_datetime).toGMTString())
      let url = item.url.match(/^https{0,1}:/) ? item.url : "//" + item.url;



      return `
      <li class='${item.event_type} event-obj within-bound' data-lat='${item.lat}' data-lng='${item.lng}'>
        <div class="type-event type-action">
          <h2 class="event-title"><a href="${url == '//' ? 'javascript: void(null)' : url}" target='_blank'>${item.title}</a></h2>
          <div class="event-date date" style="display: ${!item.start_datetime ? 'none' : 'block'}">${date}</div>
          <div class="event-address address-area">
            <p>${item.venue}</p>
          </div>
          <div class="call-to-action" style='display: ${url == '//' ? 'none' : 'block'}'>
            <a href="${url == '//' ? 'javascript: void(null)' : url}" target='_blank' class="btn btn-secondary rsvp">RSVP</a>
          </div>
        </div>
      </li>
      `
    };

    const renderGroup = (item) => {
      let url = item.website.match(/^https{0,1}:/) ? item.website : "//" + item.website;
      return `
      <li class='${item.event_type} group-obj' data-lat='${item.lat}' data-lng='${item.lng}'>
        <div class="type-group group-obj">
          <ul class="event-types-list">
            <li class="tag tag-${item.supergroup}">${item.supergroup}</li>
          </ul>
          <h2><a href="${url}" target='_blank'>${item.name}</a></h2>
          <div class="group-details-area">
            <div class="group-location location">${item.location}</div>
            <div class="group-description">
              <p>${item.description}</p>
            </div>
          </div>
          <div class="call-to-action">
            <a href="${url}" target='_blank' class="btn btn-secondary">Get Involved</a>
          </div>
        </div>
      </li>
      `
    };

    return {
      $list: $target,
      updateFilter: (p) => {
        if(!p) return;

        // Remove Filters

        $target.removeProp("class");
        $target.addClass(p.filter ? p.filter.join(" ") : '')
      },
      updateBounds: (bound1, bound2) => {

        // const bounds = [p.bounds1, p.bounds2];


        $target.find('ul li.event-obj, ul li.group-obj').each((ind, item)=> {

          let _lat = $(item).data('lat'),
              _lng = $(item).data('lng');

          // console.log("updateBounds", item)
          if (bound1[0] <= _lat && bound2[0] >= _lat && bound1[1] <= _lng && bound2[1] >= _lng) {
            // console.log("Adding bounds");
            $(item).addClass('within-bound');
          } else {
            $(item).removeClass('within-bound');
          }
        });
        // $(item).addClass('within-bound');

        // Orders the set to nearest
        // let latCenter = (bound1[0] + bound2[0]) / 2,
        //     lngCenter = (bound1[1] + bound2[1]) / 2;
        // const sortList = (a, b) => {
        //   let _latA = $(a).data('lat'),
        //       _latB = $(b).data('lat'),
        //       _lngA = $(a).data('lng'),
        //       _lngB = $(b).data('lng');
        //
        //   let distA = Math.sqrt(Math.pow(latCenter - _latA, 2) + Math.pow(lngCenter - _lngA, 2)),
        //       distB = Math.sqrt(Math.pow(latCenter - _latB, 2) + Math.pow(lngCenter - _lngB, 2));
        //
        //   $(a).attr('data-distance', distA);
        //
        //   return distA - distB;
        // };
        //
        // $target.find('ul li.event-obj, ul li.group-obj')
        //     .sort(sortList)
        //     .appendTo($target.find('ul'));
      },
      populateList: (hardFilters, targetData) => {
        //using window.EVENT_DATA
        const keySet = !hardFilters.key ? [] : hardFilters.key.split(',');

        // console.log(targetData);

        var $eventList = targetData.map(item => {
          if (keySet.length == 0) {
            return item.event_type && item.event_type.toLowerCase() == 'group' ? renderGroup(item) : renderEvent(item);
          } else if (keySet.length > 0 && item.event_type != 'group' && keySet.includes(item.event_type)) {
            return renderEvent(item);
          } else if (keySet.length > 0 && item.event_type == 'group' && keySet.includes(item.supergroup)) {
            return renderGroup(item)
          }

          return null;

        })
        $target.find('ul li').remove();
        $target.find('ul').append($eventList);

        $target.find('ul li')

      }
    };
  }
})(jQuery);
