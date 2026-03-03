
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const email = 'gfbrito@gmail.com'
    const newPassword = '123456' // Simple password for testing
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                passwordHash: hashedPassword
            }
        })
        console.log(`Password for ${email} updated successfully.`)
        console.log(`New password is: ${newPassword}`)
    } catch (error) {
        console.error("Failed to update password:", error)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
