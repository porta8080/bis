function BIS(el){
    this.el = el;
    this.has = this.source = this.has(el);
}

function bis(el){
	return new BIS(el);
}

BIS.prototype.has = function(){
    return BIS.has(this.el);
};

BIS.has = function(el){
    var bgi = el.css('background-image');
    if(!bgi || bgi.toLowerCase() == 'none') return false;
    if(bgi.indexOf('url(') === 0){
        if(bgi.indexOf(')') === bgi.length -1){
            var source = bgi.slice(4,bgi.length-1);
            if(source[0]== '"' || source[0]=="'"){
                return source.slice(1,source.length-1);
            }else return source;
        }
    }

    return bgi;
};

BIS.prototype.getImageRatio = function(callback,params){
    if(!this.source) return null;
    BIS.getImageRatio(this.source,callback,params);
};

BIS.prototype.getElementRatio = function(callback,params){
    var er = BIS.getElementRatio(this.el,callback,params);
    if(!callback) return er;
};


BIS.getElementRatio = function(el,callback,params){
    var er = el.outerWidth()/el.outerHeight();
    if(callback) callback(er,params);
    else return er;
};

BIS.getImageRatio = function(src,callback,params){
    var size = BIS.getImageSize(src,function(size,params){
        callback(size.width/size.height,params);
    });
};

BIS.prototype.getImageSize = function(callback,params){
    if(!this.source) callback(null,params);
    BIS.getImageSize(this.source,callback,params);
};

BIS.getImageSize = function(source,callback,params){
    var img = new Image();
    img.onload = function(){
        callback({width: img.width, height: img.height},params);
    };

    img.src = source;
};

BIS.prototype.get = function(callback,params){
    BIS.get(this.el,callback,params);
};

BIS.get = function(el,callback,params){
    if(!el) return null;
    if(el instanceof jQuery) el = $(el.get(0));
    else el = $($(el).get(0));

    var bgi = BIS.has(el);
    if(!bgi) return null;
    var bgs = el.css('background-size').toLowerCase();
    var size = {},i_size,el_width,el_height,s_width,s_height,parts,height,width,vpr,ir;

    if(bgs == 'cover'){
        BIS.getImageRatio(bgi,function(ir){
            vpr = BIS.getElementRatio(el);

            el_width = el.outerWidth();
            el_height = el.outerHeight();

            if(ir <= vpr){
                size.width = el_width;
                size.height = Math.floor(el_width/ir);
            }else{
                size.width = el_height * ir;
                size.height = el_height;
            }

            callback(size,params);
        });

    }else if(bgs == 'contain'){

        BIS.getImageRatio(bgi,function(ir){
            vpr = BIS.getElementRatio(el);

            el_width = el.outerWidth();
            el_height = el.outerHeight();

            if(ir <= vpr){
                size.width = el_height * ir;
                size.height = el_height;
            }else{
                size.width = el_width;
                size.height = Math.floor(el_width/ir);
            }

            callback(size,params);
        });

    }else if(bgs == 'auto' || bgs == 'initial' || bgs == 'auto auto'){
        BIS.getImageSize(bgi,function(size){
            callback(size,params);
        });
    }else if(bgs.indexOf('%') != -1 || bgs.indexOf('px') != -1){

        BIS.getImageSize(bgi,function(image_size){
            var proportion = function(a1,a2,b1){
                return (a2/a1)*b1;
            };

            parts = bgs.split(' ');
            if(parts.length == 1) parts[1] = 'auto';

            if(parts[0].toLowerCase() == 'auto'){
                size.width = image_size.width;
            }else{
                if(bgs.indexOf('%') != -1){
                    s_width = parseInt(parts[0].replace('%',''));
                    el_width = el.outerWidth();
                    size.width = proportion(100,el_width,s_width);
                }else size.width = parseInt(parts[0].replace('px',''));
            }

            if(parts[1].toLowerCase() == 'auto'){
                size.height = image_size.height;
            }else{
                if(bgs.indexOf('%') != -1){
                    s_height = parseInt(parts[1].replace('%',''));
                    el_height = el.outerHeight();
                    size.height = proportion(100,el_height,s_height);
                }else size.height = parseInt(parts[1].replace('px',''));
            }

            callback(size,params);
        });

    }else{
        callback({width: el.outerWidth(), height: el.outerHeight()},params);
    }
};
