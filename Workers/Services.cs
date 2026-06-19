using LoudApi.Presentation;
using Microsoft.Extensions.DependencyInjection;

namespace LoudApi.Workers;

public static class Services
{
    public static IServiceCollection AddLoudPresentationServices(this IServiceCollection services)
    {
        services.AddSingleton<ILoudPresentationService, LoudPresentationService>();
        return services;
    }

    public interface ILoudPresentationService
    {
        Informations GetPresentation();

        SectionInformation? GetSection(PresentationQuery query);
    }

    public sealed class LoudPresentationService : ILoudPresentationService
    {
        private readonly Informations _presentation = Informations.LoudHome;

        public Informations GetPresentation() => _presentation;

        public SectionInformation? GetSection(PresentationQuery query)
        {
            var section = _presentation.Sections.FirstOrDefault(item =>
                item.Slug.Equals(query.NormalizedSection, StringComparison.OrdinalIgnoreCase));

            return section is null
                ? null
                : new SectionInformation(_presentation.Brand, section, _presentation.Palette);
        }
    }
}
