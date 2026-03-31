from django.core.management.base import BaseCommand
from apps.rooms.models import Room, RoomType
from apps.users.models import User

class Command(BaseCommand):
    help = 'Populate database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('Creating room types...')
        
        # Create room types
        room_types_data = [
            {'name': 'Chambre Simple', 'description': 'Chambre confortable pour une personne', 'price_per_night': 5000, 'capacity': 1},
            {'name': 'Chambre Double', 'description': 'Chambre spacieuse pour deux personnes', 'price_per_night': 8000, 'capacity': 2},
            {'name': 'Suite Junior', 'description': 'Suite élégante avec salon séparé', 'price_per_night': 12000, 'capacity': 2},
            {'name': 'Suite Présidentielle', 'description': 'Suite de luxe avec vue panoramique', 'price_per_night': 20000, 'capacity': 4},
        ]
        
        for rt_data in room_types_data:
            room_type, created = RoomType.objects.get_or_create(
                name=rt_data['name'],
                defaults={
                    'description': rt_data['description'],
                    'base_price': rt_data['price_per_night'],
                    'max_occupancy': rt_data['capacity']
                }
            )
            if created:
                self.stdout.write(f'  Created room type: {room_type.name}')
            else:
                self.stdout.write(f'  Room type already exists: {room_type.name}')

        self.stdout.write('Creating rooms...')
        
        # Create rooms
        rooms_data = [
            {'room_number': '101', 'room_type': 'Chambre Simple', 'floor': 1, 'is_available': True},
            {'room_number': '102', 'room_type': 'Chambre Simple', 'floor': 1, 'is_available': True},
            {'room_number': '103', 'room_type': 'Chambre Double', 'floor': 1, 'is_available': True},
            {'room_number': '104', 'room_type': 'Chambre Double', 'floor': 1, 'is_available': True},
            {'room_number': '201', 'room_type': 'Suite Junior', 'floor': 2, 'is_available': True},
            {'room_number': '202', 'room_type': 'Suite Junior', 'floor': 2, 'is_available': True},
            {'room_number': '301', 'room_type': 'Suite Présidentielle', 'floor': 3, 'is_available': True},
        ]
        
        for room_data in rooms_data:
            room_type = RoomType.objects.get(name=room_data['room_type'])
            room, created = Room.objects.get_or_create(
                room_number=room_data['room_number'],
                defaults={
                    'room_type': room_type,
                    'floor': room_data['floor'],
                    'is_available': room_data['is_available'],
                }
            )
            if created:
                self.stdout.write(f'  Created room: {room.room_number}')
            else:
                self.stdout.write(f'  Room already exists: {room.room_number}')

        self.stdout.write('Creating admin user...')
        
        # Create admin user
        admin_email = 'admin@hoteldarelaaz.com'
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                password='admin123',
                first_name='Admin',
                last_name='Dar El Aaz',
                role='ADMIN'
            )
            self.stdout.write(f'  Created admin user: {admin_email}')
        else:
            self.stdout.write('  Admin user already exists')

        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
        self.stdout.write('Admin credentials: admin@hoteldarelaaz.com / admin123')
