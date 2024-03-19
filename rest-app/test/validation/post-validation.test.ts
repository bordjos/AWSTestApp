import { Post } from "../../src/validation/film"
import { ClassType, transformAndValidate } from "class-transformer-validator"

describe('test post validations', ()=> {
    it('validates the post type payload', async () => {
        const post: Post = {
            author: 'kurcinaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            description: 'dsadsadas',
            publicationDate: new Date(),
            title:  'ksdjfklsdfjlsdkfjsdfsdfsdfsdfsdfsdfsdffsdgsdfgsdfgsdfgdsfgsdgsdf'
        };
        try {
            const err = await validate(Post, post);
            if(err.length > 0) {

            }
        } catch (e) {
            console.log(e)
        }
    })
})


async function validate<T extends object>(classType: ClassType<T>, object: T): Promise<string[]> {
    const errors: string[] = []
    try {
        await transformAndValidate(classType, object);
        
    } catch (e) {
        
    }

    return errors;
}