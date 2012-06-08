var annuals = [
  { 'year': '2001' },
  { 'year': '2002' },
  { 'year': '2003'
  //, 'hasData': false 
  },
  { 'year': '2004' },
  { 'year': '2005' },
  { 'year': '2006' },
  { 'year': '2007' },
  { 'year': '2008' },
  { 'year': '2009' },
  { 'year': '2010' },
  { 'year': '2011' }
];

var m,
    legend,
    overlays,
    selectedOverlay,
    year = 0,
    embedShown = false,
    activePoints = 'jv-afg-total',
    mm = com.modestmaps,
    layers = [
        'KIVU',
        'unhcr-offices',
        activePoints].join(','),
    url = 'http://a.tiles.mapbox.com/unhcr/1.0.0/' + layers + '/layer.json';


function getFormatter() {
    var count,
        marker,
        markerOffset = 0,
        markerLocation = '';
    if (year === 0) {
      count = 'data[\"Total\"]';
      marker = '';
    } else {
      count = 'data[\"'+year+'\"]';
      markerLocation = (parseVal((year+'').substr((year+'').length-2))-1);

      if (year == 2001) {
          markerOffset = 5;
      }
      else if (year == 2011) {
          markerOffset = -5;
      }

      marker = '|o,FFFFFF,0,' +
          markerLocation+',20,,:'+markerOffset+
          '|t\' + data[\"'+year+'\"] + \',282828,0,' +
          markerLocation+',12,,hv:0:0';
    }
    return "function(options, data) { switch (options.format){ case'full':return '';break; case 'location': return data[\"ProvName\"]; break; case 'teaser': default: return '<div class=\"int_total\"> <h2>Province:' + data[\"ProvName\"] + '</h2> <p>Incidents of Violence: <strong>' + "+count+" + '</strong></p> <div class=\"int_chart\"> <p>Incidents Over Time:</p> <img src=\"http://chart.apis.google.com/chart?chf=bg,s,ffffff00&chxs=0,cccccc,11.5,0,l,cccccc|1,cccccc,11.5,0,l,cccccc&chxl=0:|0|10|20|30|1:|01|02|03|04|05|06|07|08|09|10|11&chxr=0,0,30&chxt=y,x&chm=B,ef4e4e88,0,0,0"+marker+"&chbh=a,0,18&chs=350x175&cht=lc&chco=ef4e4e&chds=0,30&chd=t:' + data[\"2001\"] + ',' + data[\"2002\"] + ',0,' + data[\"2004\"] + ',' + data[\"2005\"] + ',' + data[\"2006\"] + ',' + data[\"2007\"] + ',' + data[\"2008\"] + ',' + data[\"2009\"] + ',' + data[\"2010\"] + ',' + data[\"2011\"] + '&chxtc=0,-350&chg=0,6.66667,1,.5\" width=\"350\" height=\"175\" alt=\"\" /> </div> <hr> <div class=\"int_extras\"> <h2>Province Details</h2> <p>Population: <strong>' + data[\"Population\"] + '</strong></p> <p>Adult Literacy: <strong>' + data[\"Adult Literacy\"] + '%</strong></p> <p>NATO Lead Nation: <strong>' + data[\"Regional Command\"] + '</strong></p> </div> </div>'; break; }}";
}

function getTiles() {
  return [
     "http://a.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
     "http://b.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
     "http://c.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.jpg",
     "http://d.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.jpg"
  ];
}

function getGrids() {
  return [
     "http://a.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
     "http://b.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
     "http://c.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json",
     "http://d.tiles.mapbox.com/unhcr/1.0.0/"+layers+"/{z}/{x}/{y}.grid.json"
  ];
}


//Province filter
function hideProvince(province) {
    if (year != 0) {
        var cnt = 1;
        $('<h2 class="ovheader">' + year + ' Overview: ' + province + '</h2>').replaceAll('.ovheader');
        $('tr.vjdata.'+year).addClass('hider');
        $('tr.vjdata.'+year).each(function (i) {
            if ($(this).hasClass(province)) {
                $(this).removeClass('hider');
                cnt++;
                if (cnt%2 == 0) {
                    $(this).css('background-color', '#353535');
                } else {
                    $(this).css('background-color', '#282828');
                }
            }
        });
    }
}

function refreshMap() {
  $('#map-bg').remove();
  $('#map').clone().attr('id','map-bg').prependTo('#map');

  url = 'http://a.tiles.mapbox.com/unhcr/1.0.0/' + layers + '/layer.json';
  wax.tilejson(url, function(tilejson) {
    tilejson.formatter = getFormatter();
    tilejson.minzoom = 6;
    tilejson.maxzoom = 11;
    tilejson.tiles = getTiles();
    tilejson.grids = getGrids();
    m.setProvider(new wax.mm.connector(tilejson));
    $('.wax-legends').remove();
    legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
    overlays.remove();
    overlays = wax.mm.interaction(m, tilejson, {
      clickAction: ['location'],
      clickHandler: function(data) {
            hideProvince(data);
      }
    });
  });
}


// Is this just doing parseInt(x, 10)?
function parseVal(val) {
   while (val.charAt(0) == '0')
      val = val.substring(1, val.length);

   return val;
}


var makeMap = {
    build: function(item) {
         // Year Selection
         var hasData = item.hasData === false ? 'no-data' : 'data';
         $('<li class="'+ hasData +'"><a href="' + item.year + '">' + item.year + '</a></li>')
         .appendTo('ul.annuals').click(function (e) {
             year = item.year;
            if($(this).hasClass('active')) {
                return false;
            } else {
                activePoints = 'jv-afg-' + item.year;
                e.preventDefault();
                if (item.hasData === false) return;
                $('ul.annuals li.active').removeClass('active');
                $(this).addClass('active');
                selectedOverlay = $('ul#overlay-select li.active a').attr('id');

                // Populate table data
                $('<h2 class="ovheader">' + item.year + ' Overview</h2>').replaceAll('.ovheader');
                $('#table-wrapper table').removeClass('hider');
                $('tr.vjdata').addClass('hider');
                $('#table-wrapper tr.' + item.year).removeClass('hider');
                $('#table-wrapper tr.' + item.year + ':even').css('background-color', '#353535');
                // let the tablesorter know we made a update
                $('#table-wrapper table').trigger('update');
                layers = [
                   'natural-earth-2',
                   selectedOverlay,
                   'unhcr-offices',
                   'jv-afg-' + item.year
                ];
                var cleanLayers = _.compact(layers);

                layers = cleanLayers.join(',');

                refreshMap();
            }
         });
     }
};

$(function() {

    wax.tilejson(url, function(tilejson) {
      tilejson.formatter = getFormatter();
      tilejson.minzoom = 6;
      tilejson.maxzoom = 12;
      tilejson.tiles = getTiles();
      tilejson.grids = getGrids();

      m = new mm.Map('map',
        new wax.mm.connector(tilejson),
        null,
        [
          new mm.DragHandler,
          new mm.DoubleClickHandler,
          new mm.TouchHandler
        ]);
      wax.mm.zoomer(m, tilejson).appendTo(m.parent);
      legend = wax.mm.legend(m, tilejson).appendTo(m.parent);
      wax.mm.zoombox(m, tilejson);
      var detector = wax.mm.bwdetect(m, {
          auto: true,
          jpg: '.jpg70'
      });
      m.addCallback('drawn', function lqDetect(modestmap, e) {
          if (!detector.bw()) {
              $('#bwtoggle').addClass('lq');
          }
          m.removeCallback(lqDetect);
      });
      $('#bwtoggle').toggle(
          function() {
              $(this).toggleClass('lq');
              detector.bw(!detector.bw());
          },
          function() {
              $(this).toggleClass('lq');
              detector.bw(!detector.bw());
          }
      );
      overlays = wax.mm.interaction(m, tilejson, {
          clickAction: ['location'],
          clickHandler: function(data) {
              hideProvince(data);
          }
      });
      m.setCenterZoom(new mm.Location(-1.7, 29,2), 8);
      m.addCallback("panned", function(modestmap, e) {
        $('#map-bg').remove();
      });
    });

    _.map(annuals, makeMap.build);
    $.tablesorter.defaults.widgets = ['zebra'];
    $('#table-wrapper table').tablesorter();

    $.ajax({
      url: 'data/protection-drc-vjdata.geojson',
      dataType: 'json',
      success: buildTable
    });

    function buildTable(data) {
        //
        //Build yearly data table
        $.each(data.features, function(key, val) {
            var content = '<tr class="vjdata ' + val.properties.year + ' ' + 
                val.properties.month + ' ' + 
                val.properties.incident_province +
                ' hider"><td>' + val.properties.date + '</td><td>' +
                val.properties.gender + '</td><td>' + 
                val.properties.occupation + '</td><td>' + 
                val.properties.organization + '</td><td>' + 
                val.properties.incident_type + '</td><td>' + 
                val.properties.incident_province + '</td><td>' + 
                val.properties.incident_reason + '</td><td class="last">' +
                val.properties.suspected_attacker + '</td></tr>';
                $('#table-wrapper table tbody').append(content);
        });

        var gender = _(data.features).chain()
          .map(function(val) {
             return val.properties.gender;
          })
          .flatten()
          .reduce(function(counts, word) {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {}).value();

        var incidentsPerGender = _(data.features).chain()
          .map(function(val) {
             // Calculate the value of gender against incident type
             return val.properties.gender + val.properties.incident_type;
          })
          .flatten()
          .reduce(function(counts, word) {
            counts[word] = (counts[word] || 0) + 1;
            return counts;
        }, {}).value();

        //Big Numbers
        $('#bnTotal').html($('tr').size()-1);

        var yearValues = _(_.range(2001, 2011)).map(function(m, i) {
            return {
                name: m,
                value: $('tr.' + m).size()
            };
        });

        var highYear = _(yearValues).max(function(m) {
            return m.value;
        });

        var monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'];

        var monthValues = _(monthNames).map(function(m, i) {
            return {
                name: m,
                value: $('tr.' + (i + 1)).size()
            };
        });

        var highMonth = _(monthValues).max(function(m) {
            return m.value;
        });

        $('#bnMonth').html(highMonth.name + " (" + highMonth.value + ")");

        $('#bnYear').html(highYear.name + " (" + highYear.value + ")");

        $('#bnProv').html("Kabul (" + $('tr.Kabul').size() + ")");

        // Graphs
        var incidentPerYear =  "<img src='http://chart.apis.google.com/chart?" +
            "chxl=0:|0|20|40|60|80|1:|01|02|03|04|05|06|07|08|09|10|11&amp;" +
            "chxs=0,282828|1,282828&amp;" +
            "chxr=0,0,80&amp;"+
            "chxt=y,x&amp;"+
            "chm=N*fs*,282828,0,-1,13,,h::4&amp;"+
            "chbh=a,0,21&amp;"+
            "chs=430x225&amp;"+
            "cht=bvg&amp;"+
            "chco=ef4e4e&amp;"+
            "chds=0,80&amp;" +
            "chd=t:" + _.pluck(yearValues, 'value').join(',') + "&amp;" +
            "chg=0,25,5,0' width='430' height='225' alt='Image of Yearly Incidents of Violence Against Journalists, 2001-2011' />";
        
        $('#incident-per-year').html(incidentPerYear);
        
        var incidentVsGender =  "<img src='http://chart.apis.google.com/chart?" +
            "chxl=0:|0|20|40|60|80|1:|&amp;" +
            "chxs=chxs=0,282828,12,1,_,282828|1,282828,12,1,_,282828&amp;" +
            "chxt=y&amp;chbh=a,8&amp;"+
            "chs=430x225&amp;"+
            "cht=bvs&amp;"+
            "chco=EF4E4E,63aece&amp;"+
            "chg=0,25,5,0&amp;"+
            "chds=a&amp;"+
            "chbh=21,54&amp;"+
            "chm=N*fs*,ffffff,0,-1,13,,h::-14|N*fs*,282828,1,-1,13,,h::4&amp;" +
            "chd=t:" + incidentsPerGender.MaleThreatened +
            "," + incidentsPerGender.MaleBeaten +
            "," + incidentsPerGender.MaleArrested +
            "," + incidentsPerGender.MaleKilled +
            "," + incidentsPerGender.MaleKidnapped +
            "," + incidentsPerGender.MaleInjured +
            "|" + incidentsPerGender.FemaleThreatened +
            "," + incidentsPerGender.FemaleBeaten +
            "," + incidentsPerGender.FemaleArrested +
            "," + incidentsPerGender.FemaleKilled +
            "," + incidentsPerGender.FemaleKidnapped +
            "," + 0 + "&amp;" +
            "chdl=Male&nbsp;(" + gender.Male + ")|Female&nbsp;(" + gender.Female + ")&amp;"+
            "chdlp=t&amp;"+
            "chdls=282828,12' width='430' height='225' alt='Type of Incident v.Gender' />";

        $('#incident-v-gender').html(incidentVsGender);
    }

    // Overlay Selection
     $('ul#overlay-select li a').click(function(e) {
         e.preventDefault();
         if($(this).parent().hasClass('active')) {
             $(this).parent('li').removeClass('active');
             layers = [
                   'KIVU',
                   'unhcr-offices',
                   activePoints
                 ].join(',');
            refreshMap();
         } else {
             $('ul#overlay-select li').removeClass('active');
             $(this).parent().addClass('active');
             var selectedOverlay = $(this).attr('id');
             layers = [
                     'KIVU',
                     selectedOverlay,
                     'unhcr-offices',
                     activePoints
                   ].join(',');
             refreshMap();
         }
     });

  $('li.all-data a').click(function(e) {
        e.preventDefault();
        year = 0;
        selectedOverlay = $('ul#overlay-select li.active a').attr('id');
        layers = [
            'KIVU',
            selectedOverlay,
            'unhcr-offices',
            'jv-afg-total'
        ];
        var cleanLayers = _.compact(layers);
        activePoints = 'jv-afg-total';
        $('ul.annuals li').removeClass('active');
        layers = cleanLayers.join(',');

        refreshMap();

        $(this).parent().addClass('active');
        $('#table-wrapper table').addClass('hider');
        $('.ovheader').addClass('hider');
  });

  //Feedback
  $('#feedback a.feedback').click(function (e){
        e.preventDefault();
        $(this).next('.contents').slideToggle(1);
  });

  //Modal Popup box for data
  $('#header a.notes').bind('click', openModal);

  function openModal() {
      $('#overlay, #modal').fadeIn('fast');
      return false;
  }

  if (location.hash === '#notes') {
      openModal();
  }

  $('#modal a[href$=#close]').click(function (e){
      e.preventDefault();
      $('#overlay, #modal').fadeOut(1);
  });

  // Map Embed
  $('a.embed').toggle(function(){
    var splitLayers = layers.split(',');
    var embedlayers = '';
    embedShown = true;

    _.each(splitLayers, function(num, key) {
        embedlayers += '&amp;layers%5B%5D=' + num;
    });

    var embedId = 'ts-embed-' + (+new Date());
    var url = '&amp;size=560';
    url += '&amp;size%5B%5D=500';
    url += '&amp;center%5B%5D=68.411865234375';
    url += '&amp;center%5B%5D=33.477272187760285';
    url += '&amp;center%5B%5D=' + m.coordinate.zoom;
    url += embedlayers;
    url += '&amp;options%5B%5D=zoomwheel';
    url += '&amp;options%5B%5D=legend';
    url += '&amp;options%5B%5D=tooltips';
    url += '&amp;options%5B%5D=zoombox';
    url += '&amp;options%5B%5D=zoompan';
    url += '&amp;options%5B%5D=attribution';
    url += '&amp;el=' + embedId;

    $('.tip input').attr('value', "<div id='" + embedId + "-script'><script src='http://tiles.mapbox.com/unhcr/api/v1/embed.js?api=mm" + url + "'></script></div>");
    $(this).parent().addClass('active');
    $('.tip input').select();
  },function() {
      $(this).parent().removeClass('active');
      embedShown = false;
  });

  $('#controls a').click(function() {
     if (embedShown) {
         // If the embed is open and the user begins to click
         // on new layers we want to make sure toggle is turned
         // off to capture the options set from layers.
         $('a.embed').trigger('click');
     }
  });
});
