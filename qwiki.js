  Array.prototype.sum = function(){
  	for(var i=0,sum=0;i<this.length;sum+=this[i++]);
  	return sum;
  }
  Array.prototype.max = function(){
  	return Math.max.apply({},this)
  }
  Array.prototype.min = function(){
  	return Math.min.apply({},this)
  }

  var C_WIDTH = 1024, 
    C_HEIGHT = 768, 
    C_ROWS, C_COLUMNS, MIN_WIDTH, MIN_HEIGHT, N_PHOTO,
    FLICKR_KEY = '7c33153f1201b6ced9cacb3b1bef15e7';
  
  function newCanvas() {
    var canvas = [];
    
    for (r = 0; r < C_ROWS; r++) {
      canvas[r] = [];
      for (c = 0; c < C_COLUMNS; c++) {
        canvas[r][c] = 0;
      }
    }  
    
    return canvas;
  }
  
  function mark(canvas, t, r, b, l, value) {
    var ro, co;
    for (ro = t; ro <= b; ro++) {
      for (co = l; co <= r; co++) {
        canvas[ro][co] = value;
      }
    }
  } 
   
  function placeImage(args) {
    var photos = args.photos,
      best_photos,
      best_value = 0,
      c_w = args.canvas_width,
      c_h = args.canvas_height,
      min_w = args.min_width,
      min_h = args.min_height,
      grids = C_ROWS * C_COLUMNS,
      nPhoto = photos.length,
      canvas = newCanvas(), r, rr, c, cc;
    
    var markCanvas = function (t, r, b, l, value) {
      mark(canvas, t, r, b, l, value);
    }
    
    var placeFunc = function (pNo, rem_Grid, value) {

      var r, c, rr, cc, sub, mark, left, top, right, bottom, nrg, r1 = false, r2 = false, result = false, shrinkFunc, photoSetFunc, markPhotoFunc, selfEarn = 0;
      if (pNo >= nPhoto) {
        return 0;
      }
      
      if (rem_Grid < (nPhoto - pNo)) {
        //No enough space
        return false;
      } else if (rem_Grid === (nPhoto - pNo)) {
        //Just enough space
        result = 0;
        for (r = pNo; r < nPhoto; r++) {
          result += photos[r].value * min_w * min_h;
        }
        return result;
      }
      
      console.log([pNo, nPhoto, rem_Grid]);
      
      photoSetFunc = function (top, right, bottom, left) {
        var p = photos[pNo];
        p.left = left;
        p.top = top;
        p.right = right;
        p.bottom = bottom;
        
        if (pNo === nPhoto) {
          console.log(photos);
        }
      }
      
      markPhotoFunc = function () {
        // Put the image onto canvas
        var p = photos[pNo];
        
        markCanvas(p.top, p.right, p.bottom, p.left, 1);
      }
      
      //Find along the left edge
      for (r = 0; r < C_ROWS; r++) {
        if (!canvas[r][0]) {
          //Find the rectangle
          mark = 0;
                    
          for (c = 0; c < C_COLUMNS; c++) {
            for (rr = r; rr < C_ROWS; rr++) 
              if (canvas[rr][c]) { mark = 1; break; }
            if (mark) { break };
          }
          
          left = 0, top = r, right = c - 1, bottom = C_ROWS - 1; //The biggest possible rectangle
          markCanvas(top, right, bottom, left, 1);
          
          for (cc = right; cc >= left; cc--) {
            for (rr = bottom; rr >= top; rr--) {
              if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
                break;
              }
              // Try to shrink
              markCanvas(rr + 1, right, bottom, left, 0);
              markCanvas(top, right, bottom, cc + 1, 0);
              nrg = rem_Grid - (cc - left + 1) * (rr - top + 1);
              
              r1 = placeFunc(pNo + 1, nrg);
              if (r1 !== false) {
                r1 += photos[pNo].value * (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                if (result === false || r1 >= result) {
                  result = r1;
                  selfEarn = (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                  photoSetFunc(top, cc, rr, left);
                }
                break;
              }
            }
            if (r1 !== false) { break; }
            if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
              break;
            }
          }
          
          markCanvas(top, right, bottom, left, 1);
          
          for (rr = bottom; rr >= top; rr--) {
            for (cc = right; cc >= left; cc--) {
              if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
                break;
              }
              markCanvas(rr + 1, right, bottom, left, 0);
              markCanvas(top, right, bottom, cc + 1, 0);
              nrg = rem_Grid - (cc - left + 1) * (rr - top + 1);
              
              r2 = placeFunc(pNo + 1, nrg);
              if (r2 !== false) {
                r2 += photos[pNo].value * (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                if (result === false || r2 >= result) {
                  result = r2;
                  selfEarn = (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                  photoSetFunc(top, cc, rr, left);
                }
                break;
              }
            }
            if (r2 !== false) { break; }
            if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
              break;
            }
          }   
          
          markCanvas(top, right, bottom, left, 0);
          break;
        }
      }
      
      r1 = r2 = false;
      
      //Find along the top edge
      for (c = 0; c < C_COLUMNS; c++) {
        if (!canvas[0][c]) {
          mark = 0;
          for (r = 0; r < C_ROWS; r++) {
            for (cc = c; cc < C_COLUMNS; cc++)
              if (canvas[r][cc]) { mark = 1; break; }
            
            if (mark) { break; }
          }
        
          left = c; right = C_COLUMNS - 1; top= 0, bottom = r - 1;
          markCanvas(top, right, bottom, left, 1);
          
          for (cc = right; cc >= left; cc--) {
            for (rr = bottom; rr >= top; rr--) {
              if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
                break;
              }
              // Try to shrink
              markCanvas(rr + 1, right, bottom, left, 0);
              markCanvas(top, right, bottom, cc + 1, 0);
              nrg = rem_Grid - (cc - left + 1) * (rr - top + 1);
              
              r1 = placeFunc(pNo + 1, nrg);
              if (r1 !== false) {
                r1 += photos[pNo].value * (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                if (result === false || r1 >= result) {
                  result = r1;
                  selfEarn = (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                  photoSetFunc(top, cc, rr, left);
                }
                break;
              }
            }
            if (r1 !== false) { break; }
            if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
              break;
            }
          }
          
          markCanvas(top, right, bottom, left, 1);
          
          for (rr = bottom; rr >= top; rr--) {
            for (cc = right; cc >= left; cc--) {
              if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
                break;
              }
                
              markCanvas(rr + 1, right, bottom, left, 0);
              markCanvas(top, right, bottom, cc + 1, 0);
              nrg = rem_Grid - (cc - left + 1) * (rr - top + 1);
              
              r2 = placeFunc(pNo + 1, nrg);
              if (r2 !== false) {
                r2 += photos[pNo].value * (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                if (result === false || r2 >= result) {
                  result = r2;
                  selfEarn = (rr - top + 1) * (cc - left + 1) * min_h * min_w;
                  photoSetFunc(top, cc, rr, left);
                }
                break;
              }
            }
            if (r2 !== false) { break; }
            if ((rr - top + 1) * (cc - left + 1) * min_h * min_w < selfEarn) {
              break;
            }
          }    
          
          markCanvas(top, right, bottom, left, 0);
          break;
        }
      }
      
      markPhotoFunc();
    
      return result;
    }
    
    photos.sort(function (a, b) {
      b.value - a.value;
    });
    
    placeFunc(0, grids, 0);
    console.log(photos);
    photos = best_photos;
    
    return canvas;
  }
  
  function outputFlickr(args) {
    var photos = args.photos,
    c_w = args.canvas_width,
    c_h = args.canvas_height,
    min_w = args.min_width,
    min_h = args.min_height,
    p;
    
    for (p = 0; p < photos.length; p++) {
      if (photos[p].hasOwnProperty('left')) {
        $("<p></p>").text("Picture " + p + " placed at " + [photos[p].top, photos[p].right, photos[p].bottom, photos[p].left]).appendTo("#result-text");
        $("<img></img>").attr("src", photos[p].url).css({
          'position': 'absolute',
          'top': min_h * (photos[p].top ),
          'left': min_w * (photos[p].left),
          'width': min_w * (photos[p].right - photos[p].left + 1),
          'height': min_h * (photos[p].bottom - photos[p].top + 1)
        }).appendTo("#canvas");
      } else {
        break;
      }
    }
  }
  
  function outputPatterns(args) {
    var photos = args.photos,
    c_w = args.canvas_width,
    c_h = args.canvas_height,
    min_w = args.min_width,
    min_h = args.min_height,
    canvas = newCanvas(), c, r,
    p;
    
    for (p = 0; p < photos.length; p++) {
      if (photos[p].hasOwnProperty('left')) {
        $("<p></p>").text("Picture " + p + " placed at " + [photos[p].top, photos[p].right, photos[p].bottom, photos[p].left]).appendTo("#result-text");
        $("<a></a>").css({
          'position': 'absolute',
          'display': 'block',
          'top': min_h * (photos[p].top),
          'left': min_w * (photos[p].left),
          'width': min_w * (photos[p].right - photos[p].left + 1),
          'height': min_h * (photos[p].bottom - photos[p].top + 1),
          'background': "url('" + photos[p].imageUrl + "') repeat center center"
        }).attr({'href': photos[p].url, 'target': '_blank'}).text(" " + p + " ").appendTo("#canvas");
        mark(canvas, photos[p].top, photos[p].right, photos[p].bottom, photos[p].left, 1);
      } else {
        break;
      }
    }
    
    for (r = 0; r < canvas.length; r++) {
      for (c = 0; c < canvas[r].length; c++) {
        if (!canvas[r][c]) {
          $("<p></p>").text("Picture " + p + " placed at " + [r, c, r, c]).appendTo("#result-text");
          $("<a></a>").css({
            'position': 'absolute',
            'display': 'block',
            'top': min_h * r,
            'left': min_w * c,
            'width': min_w,
            'height': min_h,
            'background': "url('" + photos[p].imageUrl + "') repeat center center"
          }).attr({'href': photos[p].url, 'target': '_blank'}).text(" " + p + " ").appendTo("#canvas");
          p++;
          
          if (p === photos.length) {
            return;
          }
        }
      }
    }
  }
  
  function place(photos, output) {
    var args = {
      photos: photos,
      canvas_width: C_WIDTH,
      canvas_height: C_HEIGHT,
      min_width: MIN_WIDTH,
      min_height: MIN_HEIGHT
    }
    
    args.canvas = placeImage(args);
    
    output(args);
  }
  
  function makeGrid() {
    var table = $("<table><tbody></tbody></table>"), 
      width = MIN_WIDTH - 2, 
      height = MIN_HEIGHT - 2,
      td = $("<td></td>"),
      tr = $("<tr></tr>").height(height + 2), 
      rows = C_ROWS, 
      columns = C_COLUMNS, 
      r, c;
    
    $("#grid>*").detach();
  
    for (c = 0; c < columns; c++) {
      td.clone().css({
        'width': width,
        'height': height
      }).appendTo(tr);
    }
      
    for (r = 0; r < rows; r++) {
      tr.clone().appendTo(table);
    }
    
    table.appendTo('#grid');
  }
  
  function getFlickr() {
    var c_value = $("#comment_value").val(),
      f_value = $("#favorite_value").val(),
      nPhoto = $("#photo_no").val();
    
    $("#loading_photo").show();
    $("#canvas>*").detach();
    $("#result-text>*").detach();
    
    $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.search&jsoncallback=?",
      {
        'api_key': FLICKR_KEY,
        'format' : 'json',
        'safe_search': '1',
        'tags': 'cat',
        'per_page': nPhoto,
        'page': '5',
        'sort': 'interestingness-desc'
      }, function (data) {
        var photos = [], p, orig = data.photos.photo, a_count = 0;
      
        for (p = 0; p < orig.length; p++) {
          photos.push({
            'title': orig[p].title,
            'id': orig[p].id,
            'owner': orig[p].owner,
            'url': "http://farm" + orig[p].farm + ".static.flickr.com/" + orig[p].server + "/" + orig[p].id + "_" + orig[p].secret + ".jpg",
            'value': 0
          });
        
          $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.getFavorites&jsoncallback=?",
          {
            'api_key': FLICKR_KEY,
            'format' : 'json',
            'photo_id': orig[p].id,
            'per_page': '50'
          }, (function (photo) {
            return function (data) {
              photo.nFavorites = data.photo && data.photo.person ? data.photo.person.length : 0;
              photo.value += photo.nFavorites * f_value;
              if (++a_count === nPhoto * 2) {
                $("#loading_photo").hide();
                place(photos, outputFlickr);
              }
            }
          })(photos[p]));
          
          $.getJSON("http://api.flickr.com/services/rest/?method=flickr.photos.comments.getList&jsoncallback=?",
          {
            'api_key': FLICKR_KEY,
            'format' : 'json',
            'photo_id': orig[p].id,
            'per_page': '50'
          }, (function (photo) {
            return function (data) {
              photo.nComments = data.comments && data.comments.comment ? data.comments.comment.length : 0;
              photo.value += photo.nComments * c_value;
              if (++a_count === nPhoto * 2) {
                $("#loading_photo").hide();
                place(photos, outputFlickr);
              }
            }
          })(photos[p]));
        }
      }
    )
  }
  
  function getPatterns() {
    $.getJSON("http://www.colourlovers.com/api/patterns?jsonCallback=?",
      {
        'orderCol': 'score',
        'numResults': N_PHOTO,
        'sortBy': 'DESC',
        'resultOffset': Math.floor(Math.random()*11)
      }, function (data) {
        for (var d = 0; d < data.length; d++) {
          data[d].value = data.length - d;
        }
        place(data, outputPatterns);
      });
  }
  
  function setup() {
    $("#canvas>*").detach();
    $("#result-text>*").detach();
    C_ROWS = $("#rows").val();
    C_COLUMNS = $("#columns").val();
    N_PHOTO = $("#photo_no").val();
    MIN_WIDTH = C_WIDTH / C_COLUMNS;
    MIN_HEIGHT = C_HEIGHT / C_ROWS;
  }
  
  setup();
  getPatterns()
  
  //makeGrid();
  
  $("#gen").click(function () {
    setup();
    //makeGrid();
    //getFlickr();
    getPatterns()
  });

