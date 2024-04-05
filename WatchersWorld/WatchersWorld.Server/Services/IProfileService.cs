﻿using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    public interface IProfileService
    {
        Task<ProfileInfoDto> GetUserProfileAsync(string username);
        Task<bool> UpdateUserProfileAsync(string userId, ProfileInfoDto profileInfo);
    }

    public class ProfileService : IProfileService
    {
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;

        public ProfileService(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<ProfileInfoDto> GetUserProfileAsync(string username)
        {
            var user = await _context.ProfileInfo
             .FirstOrDefaultAsync(p => p.UserName == username);

            if (user == null)
            {
                throw new NullReferenceException("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserName == user.UserName);

            return new ProfileInfoDto
            {
                UserName = data.UserName,
                Description = data.Description,
                BirthDate = data.BirthDate,
                Gender = data.Gender,
                ProfilePhoto = data.ProfilePhoto,
                CoverPhoto = data.CoverPhoto,
                ProfileStatus = data.ProfileStatus,
                Followers = data.Followers,
                Following = data.Following
            };
        }

        public async Task<bool> UpdateUserProfileAsync(string userId, ProfileInfoDto profileInfo)
        {
            var user = await _context.ProfileInfo
            .FirstOrDefaultAsync(p => p.UserId == userId);

            if (user == null)
            {
                throw new NullReferenceException("Não foi possível encontrar o utilizador");
            }

            // Atualiza o perfil com os novos dados
            user.Description = profileInfo.Description;
            user.Gender = profileInfo.Gender;
            user.BirthDate = profileInfo.BirthDate;
            user.CoverPhoto = profileInfo.CoverPhoto;
            user.ProfilePhoto = profileInfo.ProfilePhoto;
            user.ProfileStatus = profileInfo.ProfileStatus;
            user.Followers = profileInfo.Followers;
            user.Following = profileInfo.Following;

            // Salva as mudanças no contexto
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }
    }
}
