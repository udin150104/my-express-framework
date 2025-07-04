$(document).ready(function(){
  $(document).on("click","#show-pass",function(){
    let target = $(this).data("target");
    let type = $(`#${target}`).attr("type");
    if(type === target){ 
      $(`#${target}`).attr("type","text");
      $(this).find('.bi').removeClass("bi-eye").addClass("bi-eye-slash");
    }else{ 
      $(`#${target}`).attr("type",target);
      $(this).find('.bi').removeClass("bi-eye-slash").addClass("bi-eye");
    }
  });
});