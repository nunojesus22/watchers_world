﻿using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Media
{
    public class MediaInfoModel
    {

        [Key] 
        public int IdTableMedia { get; set; }
        

        public int IdMedia { get; set; }



        public string? Type { get; set; }

    }
}