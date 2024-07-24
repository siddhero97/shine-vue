# Migrations

This document tracks the database migrations for the project.

## Running migrations

Run the following to update to the latest version of the database before running the backend.

```sh
npx sequelize-cli db:migrate
```

## List of Migrations

### TODO:



- [ ] Create userCategory model and survey generation logic.

### 2021-04-03

```
npx sequelize-cli migration:generate --name retype-userpreference-value-to-jsonb
npx sequelize-cli migration:generate --name retype-surveyquestions-answer-to-jsonb
```

### 2021-03-27

- [x] Create AccessKey model
```
npx sequelize-cli model:generate --name AccessKey --attributes key:string,surveyId:integer,validAt:date,expiresAt:date
```

### 2021-03-20

- [x] Add categoryId to SurveyQuestions
```
sequelize-cli migration:generate --name add-categoryid-to-survey-question
```

- [x] Rename table CategorySurveys to SurveySections

```
sequelize-cli migration:generate --name rename-category-survey-to-section
```

### 2021-03-20

- [x] Update CategorySurveys table to include tookPart field.

```sh
sequelize-cli migration:generate --name add-field-category-survey-tookpart
```

- [o] ~~Create surveydatum table~~

**surveyData table**

The surveyData table would have been a polymorphic table similar to the userPreferences table. It would have been used to hold survey responses for both questions (the answer) and categories (whether they took part in an activity).
However the categorySurveys table can be modified to incude the tookPart field. Also query efficiency might be an issue with many surveys, due to the answerableType string field.

- id : number (Sequelize.INTEGER)
- surveyId : number (Sequelize.INTEGER)
- answerableId : number (Sequelize.INTEGER)
- answerableType : string (Sequelize.STRING)
- value : (Sequelize.JSON) Category->tookPart or Question->answer

Model name is SurveyDatum

npx sequelize-cli model:generate --name SurveyDatum --attributes userId:number,associatedId:number,associatedType:string,value:string

Option to an index during creation (https://sequelize.org/master/manual/indexes.html):

```
  indexes: [
    {
      unique: true,
      fields: ['userId', 'associatedId', 'associatedType']
    }
  ]
```


### 2021-03-19

- [x] Create userDefaults model

**userPreferences table:**

- id : number (Sequelize.INTEGER)
- userId : number (Sequelize.INTEGER)
- associatedId : number (Sequelize.INTEGER)
- associatedType : string (Sequelize.STRING)
- value : string (Sequelize.STRING) or (Sequelize.JSON)

npx sequelize-cli model:generate --name UserPreference --attributes userId:number,associatedId:number,associatedType:string,value:string

Option to an index during creation (https://sequelize.org/master/manual/indexes.html):

```
  indexes: [
    {
      unique: true,
      fields: ['userId', 'associatedId', 'associatedType']
    }
  ]
```

Querying the table with Sequelize:

```json
{
  where: {
    [Op.and]: [
      { userId : x },
      { modelId : y },
      { modelName : z }
    ]
  }
  attributes: [['value', 'default' ]]
}
```


**userCategory table:**

- id : number
- userId : number
- categoryId : number

- [x] convert new models to TypeScript

### 2021-03-18

- [x] Create the category and surveyCategory models.
- [x] Create question and surveyQuestion models

**question table:**

- id : number
- order? : number
- questionPrompt : string
- answerType : number
- options? : string[] <--- json?
- validations : string[]

**surveyQuestion table:**

- id : number
- surveyId : number
- questionId : number
- answer : string  <-- json? answer stored here.

```sh
npx sequelize-cli model:generate --name Question --attributes order:number,answerType:string,questionPrompt:string,options:string,validations:string

npx sequelize-cli model:generate --name SurveyQuestion --attributes surveyId:number,questionId:number,answer:string
```

### 2021-03-17

**category table:**
id : number
description : string
order? : number

**surveyCategory table:**
id : number
categoryId : number
surveyId : number


```sh
npx sequelize-cli model:generate --name Category --attributes description:string,order:integer

npx sequelize-cli model:generate --name CategorySurvey --attributes categoryId:string,surveyId:integer
```

### 2021-03-16

- [x] Create basic User
- [x] Create survey (belongs to user)

```sh
npx sequelize-cli model:generate --name User --attributes displayName:string

npx sequelize-cli model:generate --name Survey --attributes userId:integer,surveyDate:date,startDate:date,modifyDate:date,submitDate:date,status:integer
```
