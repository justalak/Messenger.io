var db= require('../database/messageQuery');

module.exports={
    getMessage: async(req,res)=>{
        var messages=await db.getMessage(req.params.conv_id,req.params.page);
        res.json(messages);
    },
    addMessage: async(req,res)=>{
        await db.addMessage(req.body.conv_id,req.body.user_send, req.body.content);
    },
    getPreview: async(req,res)=>{
        var preview= await db.getPreviewMessage(req.params.conv_id);
        res.json(preview);
    }
}