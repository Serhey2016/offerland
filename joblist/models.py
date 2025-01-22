from django.db import models

# Create your models here.
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

class Industry(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Industries"

    def __str__(self):
        return self.name

class BusinessArea(models.Model):
    business_area = models.CharField(max_length=70, unique=True)

    def __str__(self):
        return self.business_area

class Country(models.Model):
    countries = models.CharField(max_length=70, unique=True)

    class Meta:
        verbose_name_plural = "Countries"

    def __str__(self):
        return self.countries

class TownCity(models.Model):
    town_city = models.CharField(max_length=70, unique=True)

    class Meta:
        verbose_name_plural = "Towns/Cities"

    def __str__(self):
        return self.town_city

class TypeNRating(models.Model):
    type_n_rating = models.CharField(max_length=70, unique=True)

    def __str__(self):
        return self.type_n_rating

class Route(models.Model):
    route = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.route

class VisasNames(models.Model):
    visa_names = models.CharField(max_length=250, unique=True)
    description = models.TextField()

    class Meta:
        verbose_name_plural = "Visa Names"

    def __str__(self):
        return self.visa_names

class WorkModel(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.name

class EmploymentType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField()

    def __str__(self):
        return self.name

class InterviewStages(models.Model):
    stage = models.CharField(max_length=70)
    description = models.TextField(max_length=500)

    class Meta:
        verbose_name_plural = "Interview Stages"

    def __str__(self):
        return self.stage

class AllTags(models.Model):
    tag = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "All Tags"

    def __str__(self):
        return self.tag

class ContractType(models.Model):
    contract_type = models.CharField(max_length=70)

    def __str__(self):
        return self.contract_type

class Companies(models.Model):
    id_company = models.AutoField(primary_key=True)
    comp_logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    company_name = models.CharField(max_length=150)
    legal_name = models.CharField(max_length=90, unique=True, null=True, blank=True)
    industry = models.ManyToManyField(Industry, related_name='companies')
    business_area = models.ManyToManyField(BusinessArea, related_name='companies')
    website = models.URLField(max_length=70, unique=True, null=True, blank=True)
    town_n_city = models.ManyToManyField(TownCity, related_name='companies')
    county = models.ManyToManyField(Country, blank=True, related_name='companies')
    route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True, blank=True, related_name='companies')
    contact_email = models.EmailField(null=True, blank=True)
    contact_number = models.CharField(max_length=70, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    address = models.TextField(blank=True)
    postcode1 = models.CharField(max_length=20, null=True, blank=True)
    postcode2 = models.CharField(max_length=20, null=True, blank=True)
    career_opportunities_calculated = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    compensation_n_benefits = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    culture_n_values = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    senior_management = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    work_life_balance = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)

    class Meta:
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.company_name

class Vacancies(models.Model):
    job_title = models.CharField(max_length=150)
    id_company = models.ForeignKey(Companies, on_delete=models.CASCADE, related_name='vacancies')
    visa_name = models.ForeignKey(VisasNames, on_delete=models.SET_NULL, null=True, blank=True, related_name='vacancies')
    dependent_visa_costs = models.CharField(max_length=300, null=True, blank=True)
    work_model = models.ManyToManyField(WorkModel, related_name='vacancies')
    employment_type = models.ManyToManyField(EmploymentType, related_name='vacancies')
    contract_type = models.ManyToManyField(ContractType, related_name='vacancies')
    salary_1 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    vacancy_link = models.URLField()
    job_description = models.TextField()
    application_deadline = models.DateField()
    interview_stages = models.ManyToManyField(InterviewStages, related_name='vacancies')
    posting_date = models.DateTimeField(default=timezone.now)
    tags = models.ManyToManyField(AllTags, related_name='vacancies')
    published = models.BooleanField(default=False)
    url_vacancy = models.URLField()

    class Meta:
        verbose_name_plural = "Vacancies"

    def __str__(self):
        return self.job_title

class UserVacancyRelation(models.Model):
    STATUS_CHOICES = [
        ('delete', 'На удаление'),
        ('pending', 'Не рассмотрено'),
        ('fit', 'Подходит')
    ]

    id_vacancy = models.ForeignKey(Vacancies, on_delete=models.CASCADE, related_name='user_relations')
    id_user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='vacancy_relations')
    cover_letter = models.TextField(max_length=600)
    resume = models.FileField(upload_to='resumes/')
    control_status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.id_user.username} - {self.id_vacancy.job_title}"

class RelationWorkNUser(models.Model):
    user_id = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='work_relations')
    company_id = models.ForeignKey(Companies, on_delete=models.CASCADE, related_name='work_relations')
    career_opportunities = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    compensation_n_benefits = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    culture_n_values = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    senior_management = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    work_life_balance = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    review_text = models.TextField(blank=True)
    start_date_of_work = models.DateField()
    end_date_of_work = models.DateField()

    class Meta:
        verbose_name = "Work Experience and Rating"
        verbose_name_plural = "Work Experiences and Ratings"

    def __str__(self):
        return f"{self.user_id.username} - {self.company_id.company_name}"