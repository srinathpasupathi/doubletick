// YOUR JAVASCRIPT CODE FOR INDEX.HTML GOES HERE
$(document).ready(function(){

	$('form').on('submit', function(){
  
		var item = $('form input');
		var todo = {item: item.val()};
		$.ajax({
		  type: 'POST',
		  url: '/server/doubletick/todo',
          contentType: "application/json; charset=utf-8",
          data : JSON.stringify(todo),
		  success: function(data){
                console.log(data);
                if(data==='UNAUTHENTICATED')
                {
                    window.location = '/';
                }
                else
                {
                    $("#todo-table ul").append(data);
                    $("#itemVal").val("");
                }
          },
          error : function(res, err)
          {
            console.log(err);
          }
        });
        return false;
    });
    
    $(document).on("click","#todo-table ul li",function()
    { 
        var item = $(this).attr("value");
		  $.ajax({
		  type: 'DELETE',
		  url: '/server/doubletick/todo' + item,
		  success: function(data){
            if(data==='UNAUTHENTICATED')
            {
                window.location = '/';
            }
            else
            {
                $('#todo-table ul li[value="' + data +'"]').remove();
            }
		  }
        });
        return false;
	});
  });