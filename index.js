var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var db = mongojs('mongodb://jahnavi:jahnavi@cluster0-shard-00-00-lhkoh.mongodb.net:27017,cluster0-shard-00-01-lhkoh.mongodb.net:27017,cluster0-shard-00-02-lhkoh.mongodb.net:27017/DataCollection?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority',['Subject','Faculty','Videos'])
var bcrypt = require('bcrypt')

/* GET home page. */
router.get('/',function(req,res,next){
  res.render('form',{});
});

router.post('/getdata',function(req,res,next){
  var usertype1 = req.body.usertype;
  // console.log(usertype1);
  if(usertype1 == "Faculty"){
    res.render('home',{});
  }
  else{
    res.redirect('/videopage');
  }
})

router.get('/login',function(req, res, next){
  res.render('home',{});
});

router.get('/register',function(req, res, next){
  var status = req.query.status;
  res.render('register',{msg:status});
});

router.post('/insertion',function(req,res,next){
  var name = req.body.name;
  var id = req.body.fid;
  // console.log(req.body.pass);
  bcrypt.hash(req.body.pass,10,function(err,hashedPass){
    if(err){
      console.log(err);
    }
    // console.log(name,id,hashedPass);
    db.Faculty.insert({name:name,fid:id,password:hashedPass},function(err,docs){
      if(err){
        console.log(err);
      }
      else{
        res.redirect('/login');
      }
    })
  });
});

router.post('/validation',function(req,res,next){
  var id = req.body.fid;
  var pd = req.body.pswd;
  // console.log(id,pd);
  db.Faculty.find({fid:id},function(err,docs){
    if(err){
      res.send("Please Enter Correct Credentials");
    }
    else{
      // console.log(docs[0].password);
      if(docs.length == 0){
        res.redirect('/register?status=Not a registered user!!');
      }
      else{
        bcrypt.compare(pd,docs[0].password,function(err,result){
          if(err){
            res.send("Enter correct Credentials"+err)
          }
          if(result){
            res.render('form1',{})
          }
          else{
            res.send("Enter correct Credentials")
          }  
        });
      }
    }
  })
});

router.post('/selection',function(req,res,next){
  var func = req.body.directedto;
  console.log(func);
  if(func == "Videopage"){
    res.redirect('/videopage')
  }
  else{
    res.redirect('/uploadVideo');
  }
});

router.get('/videopage',function(req,res,next){
  db.Videos.find({},function(err,docs){
    if(err){
      res.send(err)
    }
    else{
        var links = new Array();
        // console.log(docs);
        docs.forEach(element => {
          var li;
          if(element.url.includes('youtube') || element.url.includes('youtu.be')){
            li = element.url+"/"+element.topic+"/"+element.dateofupload;
          }
          else{
            li = element.url+"////"+element.topic+"////"+element.dateofupload;
          }
          // console.log(li);
          var scode = element.subjectcode;
          // console.log(scode)
          var sname;
          db.Subject.find({subjectcode:scode},function(err,docs){
            if(err){
              res.send(err);
            }
            else{
              // console.log(docs[0].subjectname);
              // console.log(li);
              sname = docs[0].subjectname;
              // console.log(li);
            }
          });
          // console.log(sname);
          links.push(li);
        });
        // console.log(links);
        // shuffle(links);
        res.render('homepage',{links:links});
    }
  })
})

router.get('/uploadVideo',function(req,res,next){
  res.render('uploaddata',{});
})

router.post('/datauploaded',function(req,res,next){
  var sname = req.body.sname;
  var scode = req.body.scode;
  var branch = req.body.branch;
  var sem = req.body.sem;
  var topic = req.body.topic;
  var date = req.body.date;
  var url = req.body.url;
  db.Subject.insert({subjectname:sname,subjectcode:scode,branch:branch,semester:sem},function(err,docs){
      if(err){
        res.send(err)
      }
      else{
        db.Videos.insert({subjectcode:scode,topic:topic,dateofupload:date,url:url},function(err,docs){
          if(err){
            res.send(err);
          }
          else{
            res.send("Data Uploaded successfully");
          }
        })
      }
  });
});

module.exports = router;   