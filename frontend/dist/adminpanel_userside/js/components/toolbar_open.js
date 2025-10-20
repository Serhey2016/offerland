
$(document).on('toolbarItemClick', function(e, item) {
  var url = $(item).attr('href');
  if (url && url !== 'javascript:void(0)') {
    window.location.href = url;
  }
});

// $(document).on('toolbarItemClick', function(e, item) {
//     console.log('toolbarItemClick triggered', item);
//     var url = $(item).attr('href');
//     console.log('url: ', url);
//     if (url && url !== 'javascript:void(0)') {
//       window.location.href = url;
//     }
//   });